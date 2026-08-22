import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/server";
import { extractCandidateFrames, extractFrameAt, extractLastFrame } from "./encode";
import { REEL_HEIGHT, REEL_WIDTH } from "./frames";

/**
 * Cover images for uploaded reels.
 *
 * A generated product reel gets its cover for free — `build.ts` already has the source
 * stills on disk and resizes the first one. An **uploaded** video has no such source, so
 * nothing ever wrote `thumbnail_url` for it, and every `kind: "upload"` row sat with a null
 * cover.
 *
 * That was invisible until Pinterest arrived, because Instagram and Facebook generate their
 * own thumbnails from the video. Pinterest does not: a video pin **requires** a cover image,
 * so an uploaded reel could not be pinned at all.
 *
 * **Which frame is not obvious, and the intuitive answer is wrong.** The last frame was the
 * first choice — these reels were expected to close on a held product shot. In practice they
 * close on the brand outro card, so every cover came out as the logo on a green background:
 * a valid image, and a poor pin. Pinterest is a visual search engine; a logo communicates
 * nothing about the garment and gives nobody a reason to save or click.
 *
 * So the frame is *chosen* rather than positional — see `pickBestFrameSecond`.
 */

const BUCKET = "social-media";

/**
 * Seconds into the video worth taking a cover from.
 *
 * Intros fade in and outros are brand cards, so both ends are excluded. The proportions are
 * generous rather than tuned: the aim is to avoid the title card, not to find one perfect
 * frame, and the scoring below handles the rest.
 */
const SKIP_HEAD = 0.1;
const SKIP_TAIL = 0.25;

/**
 * Picks the second whose frame makes the best cover, or null if nothing can be measured.
 *
 * Scored on **detail** — the mean standard deviation across colour channels. A flat title
 * card, a fade, or a blurred pan all measure low; an embroidery close-up or a garment on a
 * model measures high. That single number separated the real footage from the intro and
 * outro cards cleanly on the reels tested, which a positional rule could not do at all.
 *
 * Brightness is used only to reject near-black frames, not to rank: dark clothing on a dark
 * backdrop is a legitimate product shot and should not lose to a washed-out one.
 */
async function pickBestFrameSecond(workDir: string): Promise<number | null> {
  const framesDir = join(workDir, "candidates");
  // ffmpeg writes into this path but will not create it.
  await mkdir(framesDir, { recursive: true });
  await extractCandidateFrames(join(workDir, "input.mp4"), framesDir);

  const files = (await readdir(framesDir)).filter((f) => f.endsWith(".jpg")).sort();
  if (files.length === 0) return null;

  // Candidate n (1-indexed) is the frame at n-1 seconds, per `extractCandidateFrames`.
  const first = Math.floor(files.length * SKIP_HEAD);
  const last = Math.ceil(files.length * (1 - SKIP_TAIL));
  const window = files.slice(first, Math.max(last, first + 1));

  let best: { second: number; score: number } | null = null;

  for (const [offset, file] of window.entries()) {
    try {
      const stats = await sharp(join(framesDir, file)).stats();
      const detail =
        stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;
      const brightness =
        stats.channels.reduce((sum, c) => sum + c.mean, 0) / stats.channels.length;

      if (brightness < 12) continue; // essentially black — a fade, not a frame

      if (!best || detail > best.score) {
        best = { second: first + offset, score: detail };
      }
    } catch {
      // An unreadable candidate is simply not a candidate.
    }
  }

  return best?.second ?? null;
}

/**
 * Picks a cover frame from a video and stores it, returning its public URL.
 *
 * Requires ffmpeg, so this only runs where reels are already built — the owner's machine,
 * not Vercel. Callers treat a failure as non-fatal rather than losing the upload over it.
 */
export async function generateReelCover(videoUrl: string): Promise<string> {
  const workDir = await mkdtemp(join(tmpdir(), "reel-cover-"));

  try {
    const response = await fetch(videoUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not read the video to make a cover (${response.status})`);
    }

    const videoPath = join(workDir, "input.mp4");
    const framePath = join(workDir, "cover.jpg");
    await writeFile(videoPath, Buffer.from(await response.arrayBuffer()));

    /*
     * Fall back to the last frame if scoring finds nothing usable — on a video too short to
     * sample, or one whose frames cannot be read. A brand card still beats no cover at all,
     * because without one the reel cannot reach Pinterest.
     */
    const second = await pickBestFrameSecond(workDir);
    if (second === null) {
      await extractLastFrame(videoPath, framePath);
    } else {
      await extractFrameAt(videoPath, second, framePath);
    }

    // Normalised to the same 1080x1920 as a generated reel's cover, so the review grid and
    // the pin both get a predictable shape rather than whatever the source happened to be.
    const cover = await sharp(await readFile(framePath))
      .resize(REEL_WIDTH, REEL_HEIGHT, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const key = `reels/cover-${Date.now().toString(36)}.jpg`;
    const sb = createAdminClient();
    const { error } = await sb.storage.from(BUCKET).upload(key, cover, {
      contentType: "image/jpeg",
      upsert: true,
    });
    if (error) throw new Error(`Cover upload failed: ${error.message}`);

    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
    return `${base}/storage/v1/object/public/${BUCKET}/${key}`;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

/**
 * Gives one queued reel a cover, if it has a video and does not already have one.
 *
 * Returns the URL it set, or null when there was nothing to do. Never throws — every caller
 * is a place where a missing cover should degrade rather than take down an upload or a
 * publish run.
 */
export async function ensureReelCover(id: string): Promise<string | null> {
  const sb = createAdminClient();

  const { data: row } = await sb
    .from("social_media_queue")
    .select("video_url, thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  if (!row?.video_url || row.thumbnail_url) return null;

  try {
    const thumbnailUrl = await generateReelCover(row.video_url);
    await sb.from("social_media_queue").update({ thumbnail_url: thumbnailUrl }).eq("id", id);
    return thumbnailUrl;
  } catch {
    // ffmpeg missing, or an unreadable video. The reel is still perfectly publishable to
    // Instagram and Facebook, and `publishQueuedReel` explains the Pinterest case clearly.
    return null;
  }
}
