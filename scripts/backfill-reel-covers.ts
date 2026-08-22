/**
 * Gives every queued reel a cover image, taken from the video's last frame.
 *
 *   npx tsx --env-file=.env.local scripts/backfill-reel-covers.ts
 *
 * Uploaded reels never had one: `build.ts` makes a cover for a *generated* reel from its
 * source stills, but the upload path had no equivalent, so every `kind: "upload"` row sat
 * with a null `thumbnail_url`.
 *
 * That was invisible while only Meta was connected — Instagram and Facebook generate their
 * own thumbnails — and became a hard blocker with Pinterest, which requires a cover image
 * for a video pin and will not make one.
 *
 * New uploads now get a cover automatically. This is for the ones already in the queue.
 * Safe to re-run: rows that already have a cover are skipped.
 *
 * Needs ffmpeg, so run it on your own computer rather than on the server.
 */
import { createAdminClient } from "../lib/supabase/server";
import { generateReelCover } from "../lib/social/reel/cover";

async function main() {
  const sb = createAdminClient();

  const { data: rows, error } = await sb
    .from("social_media_queue")
    .select("id, kind, status, video_url, thumbnail_url, caption")
    .is("thumbnail_url", null)
    .not("video_url", "is", null)
    .not("status", "in", "(archived)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  if (!rows?.length) {
    console.log("Nothing to do — every queued reel already has a cover.");
    return;
  }

  console.log(`${rows.length} reel(s) without a cover.\n`);

  let done = 0;
  let failed = 0;

  for (const row of rows) {
    const label = `${row.kind} · ${row.status} · ${row.id.slice(0, 8)}`;
    process.stdout.write(`  ${label} … `);

    try {
      const url = await generateReelCover(row.video_url!);
      const { error: updateError } = await sb
        .from("social_media_queue")
        .update({ thumbnail_url: url })
        .eq("id", row.id);

      if (updateError) throw new Error(updateError.message);

      console.log("done");
      done += 1;
    } catch (e) {
      console.log(`FAILED — ${(e as Error).message}`);
      failed += 1;
    }
  }

  console.log(`\n${done} cover(s) created, ${failed} failed.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
