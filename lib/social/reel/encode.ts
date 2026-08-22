import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REEL_HEIGHT, REEL_WIDTH } from "./frames";

const run = promisify(execFile);

/**
 * Resolved lazily rather than imported at module load.
 *
 * `ffmpeg-static` is a devDependency and its binary is not part of a serverless bundle, so
 * a top-level import would make this module unloadable in production even for code paths
 * that never encode anything. Resolving inside the call keeps the module importable
 * everywhere and fails only where it actually matters.
 *
 * **The path it exports cannot be trusted inside Next.** `ffmpeg-static` computes its
 * binary location as `path.join(__dirname, "ffmpeg.exe")`, and the bundler rewrites
 * `__dirname` to `/ROOT` in the server bundle — so the export becomes
 * `\ROOT\node_modules\ffmpeg-static\ffmpeg.exe`, which does not exist, and encoding fails
 * with a bare `ENOENT`. The CLI script never hit this because tsx does not bundle.
 *
 * So the exported path is treated as a *hint*: used when it points at a real file, and
 * otherwise resolved from the project root, which is where the package actually lives.
 */
async function resolveFfmpeg(): Promise<string> {
  const candidates: string[] = [];

  try {
    const mod = (await import("ffmpeg-static")) as unknown as { default?: string };
    if (typeof mod.default === "string") candidates.push(mod.default);
  } catch {
    // Not installed at all — the cwd fallback below produces the useful error message.
  }

  const binary = process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg";
  candidates.push(join(process.cwd(), "node_modules", "ffmpeg-static", binary));

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }

  throw new Error(
    `ffmpeg was not found. Looked in: ${candidates.join(", ")}. ` +
      "Run `npm install` to restore ffmpeg-static, and note that reels can only be built " +
      "on your own computer — not on the server.",
  );
}

/** Can this process actually encode video? False on Vercel, true on the owner's machine. */
export function canEncodeHere(): boolean {
  return !process.env.VERCEL;
}

/**
 * Writes the **last** frame of a video to `outputPath` as a JPEG.
 *
 * `-sseof` seeks relative to the end of the file, and `-update 1` makes ffmpeg overwrite
 * the same output file for every frame it decodes — so once the tail has been walked, what
 * remains on disk is the final frame. That is the reliable idiom; `select=eq(n\,LAST)`
 * needs a frame count ffmpeg does not know while streaming, and asking for `-frames:v 1`
 * after the seek gives the *first* frame of the tail rather than the last.
 *
 * A one-second tail is enough to guarantee landing on the real final frame while keeping
 * the decode cheap. On a video shorter than that, the seek simply clamps to the start.
 *
 * The last frame is used rather than the first because these reels end on a held product
 * shot, while the opening frame is mid-motion — and this image becomes the Pinterest cover,
 * which is the entire thumbnail Pinterest ranks and displays in its grid.
 */
export async function extractLastFrame(videoPath: string, outputPath: string): Promise<void> {
  const ffmpegPath = await resolveFfmpeg();
  await run(
    ffmpegPath,
    ["-y", "-sseof", "-1.0", "-i", videoPath, "-update", "1", "-q:v", "2", outputPath],
    { maxBuffer: 1024 * 1024 * 16 },
  );
}

/**
 * Writes one small JPEG per second of video into `outDir`, named `cand-001.jpg` upward.
 *
 * Candidate `n` is the frame at `n - 1` seconds, which is what lets the caller turn its
 * choice back into a timestamp. Deliberately downscaled: these exist only to be measured,
 * and the chosen one is re-extracted at full resolution afterwards.
 */
export async function extractCandidateFrames(videoPath: string, outDir: string): Promise<void> {
  const ffmpegPath = await resolveFfmpeg();
  await run(
    ffmpegPath,
    [
      "-y", "-i", videoPath,
      "-vf", "fps=1,scale=360:-1",
      "-q:v", "5",
      join(outDir, "cand-%03d.jpg"),
    ],
    { maxBuffer: 1024 * 1024 * 32 },
  );
}

/** Writes the frame at `seconds` to `outputPath`, full resolution. */
export async function extractFrameAt(
  videoPath: string,
  seconds: number,
  outputPath: string,
): Promise<void> {
  const ffmpegPath = await resolveFfmpeg();
  await run(
    ffmpegPath,
    ["-y", "-ss", String(seconds), "-i", videoPath, "-frames:v", "1", "-q:v", "2", outputPath],
    { maxBuffer: 1024 * 1024 * 16 },
  );
}

/**
 * Turns still frames into a reel.
 *
 * ffmpeg does exactly two things here — a slow zoom across each still, and a crossfade
 * between them. It composes nothing; every pixel of layout comes from `frames.ts`, which
 * keeps the look reviewable as PNGs instead of only as video.
 *
 * Encoding runs locally rather than on Vercel. The free plan caps a function at 60s and
 * the ffmpeg binary is ~80MB — this project already avoids Vercel cron for the same
 * reasons. `ffmpeg-static` ships the binary as a devDependency so there is nothing to
 * install by hand.
 */

const FPS = 30;
/** Seconds of overlap between two shots. */
const TRANSITION = 0.5;
/** The owner asked for 10-12s. Slide time is derived to land inside that. */
const TARGET_MIN = 10;
const TARGET_MAX = 12;

export type EncodeOptions = {
  /** Absolute paths to the still frames, in order. The last one is treated as the end card. */
  framePaths: string[];
  outputPath: string;
  /** Optional licensed track, mixed under the video and faded. */
  audioPath?: string;
};

export type EncodeResult = { durationSeconds: number; command: string };

/**
 * Seconds each shot holds, chosen so the finished reel lands in the target window.
 *
 * Total runtime is not `slides x duration` — neighbouring shots overlap during the
 * crossfade, so every transition after the first shot gives back `TRANSITION` seconds.
 */
function slideSeconds(count: number): number {
  const ideal = (TARGET_MAX + TARGET_MIN) / 2;
  const raw = (ideal + (count - 1) * TRANSITION) / count;
  return Math.min(4, Math.max(2.2, Number(raw.toFixed(2))));
}

export function plannedDuration(count: number): number {
  const per = slideSeconds(count);
  return Number((count * per - (count - 1) * TRANSITION).toFixed(2));
}

/**
 * Ken Burns move for one shot.
 *
 * Direction alternates so consecutive shots do not all drift the same way, which is the
 * single clearest tell of an auto-generated slideshow. The end card is deliberately left
 * still — text sliding under a zoom is hard to read and looks cheap.
 */
function zoomFilter(index: number, frames: number, isEndCard: boolean): string {
  const common = `x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${REEL_WIDTH}x${REEL_HEIGHT}:fps=${FPS}`;
  if (isEndCard) {
    return `zoompan=z='1.0':${common}`;
  }
  // ~0.0009 per frame over ~85 frames is roughly a 1.0 -> 1.08 drift: perceptible as
  // movement, never as an obvious zoom.
  return index % 2 === 0
    ? `zoompan=z='min(1+0.0009*on,1.22)':${common}`
    : `zoompan=z='max(1.22-0.0009*on,1.0)':${common}`;
}

export async function encodeReel(options: EncodeOptions): Promise<EncodeResult> {
  const ffmpegPath = await resolveFfmpeg();
  const { framePaths, outputPath, audioPath } = options;
  if (framePaths.length < 2) throw new Error("A reel needs at least two frames");

  const per = slideSeconds(framePaths.length);
  const frames = Math.round(per * FPS);
  const total = plannedDuration(framePaths.length);

  const args: string[] = ["-y"];
  for (const path of framePaths) args.push("-i", path);

  if (audioPath) {
    args.push("-i", audioPath);
  } else {
    // Meta is happier with an audio stream present than absent, so a silent one is
    // synthesised when no track is supplied.
    args.push("-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo");
  }
  const audioInput = framePaths.length;

  // 1. One zoom-and-scale chain per still.
  const parts: string[] = framePaths.map(
    (_, i) =>
      `[${i}:v]${zoomFilter(i, frames, i === framePaths.length - 1)},setsar=1,format=yuv420p[v${i}]`,
  );

  // 2. Crossfade them together. Each offset is where the *next* shot starts appearing:
  //    the running length so far, minus the overlap it shares with the previous shot.
  let previous = "v0";
  let elapsed = per;
  for (let i = 1; i < framePaths.length; i++) {
    const label = i === framePaths.length - 1 ? "vout" : `x${i}`;
    const offset = Number((elapsed - TRANSITION).toFixed(3));
    parts.push(
      `[${previous}][v${i}]xfade=transition=fade:duration=${TRANSITION}:offset=${offset}[${label}]`,
    );
    previous = label;
    elapsed = Number((elapsed + per - TRANSITION).toFixed(3));
  }

  // 3. Audio: trim to length, fade both ends, and sit well under a voiceover-free video.
  const fadeOut = Math.max(0, total - 1.2);
  parts.push(
    `[${audioInput}:a]atrim=0:${total},asetpts=N/SR/TB,afade=t=in:st=0:d=0.8,` +
      `afade=t=out:st=${fadeOut}:d=1.2,volume=0.85[aout]`,
  );

  args.push(
    "-filter_complex", parts.join(";"),
    "-map", "[vout]",
    "-map", "[aout]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "20",
    "-profile:v", "high",
    "-pix_fmt", "yuv420p",
    // Instagram streams reels; a keyframe every second keeps seeking responsive and is
    // what Meta's own encoding guidance asks for.
    "-g", String(FPS * 2),
    "-r", String(FPS),
    "-c:a", "aac",
    "-b:a", "128k",
    "-ar", "44100",
    "-movflags", "+faststart",
    "-t", String(total),
    outputPath,
  );

  await run(ffmpegPath, args, { maxBuffer: 1024 * 1024 * 64 });
  return { durationSeconds: total, command: `ffmpeg ${args.join(" ")}` };
}
