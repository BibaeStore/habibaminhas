/**
 * Keeps the reel queue topped up.
 *
 * The problem this solves
 * -----------------------
 * Reels are encoded with ffmpeg, `ffmpeg-static` is a devDependency, and `canEncodeHere()`
 * returns false on Vercel. So the scheduler can only ever *publish* reels somebody has
 * already built by hand — which is why six approved reels had been sitting in the queue since
 * 12 August and the cadence could not be raised past two a week without the stream going
 * silent. Building on a schedule somewhere that *does* have ffmpeg is the whole fix.
 *
 * What it does NOT do
 * -------------------
 * Publish, or approve. Every reel it builds lands as a `draft`, exactly as the admin's
 * "Generate reel" button produces. Approval stays a human act: reels are reviewed regardless
 * of `approval_required` because a poor caption is embarrassing while a poor reel is twelve
 * seconds of it. This script removes the *encoding* bottleneck, not the judgement.
 *
 * Idempotent by design. It counts what is already waiting and builds only the shortfall, so
 * running it twice in a day, or re-running after a failure, cannot flood the queue.
 *
 *   npx tsx --env-file=.env.local scripts/fill-reel-queue.ts
 *   npx tsx --env-file=.env.local scripts/fill-reel-queue.ts --target 8
 *   npx tsx --env-file=.env.local scripts/fill-reel-queue.ts --max-builds 2
 */
import { createAdminClient } from "../lib/supabase/server";
import { buildProductReel } from "../lib/social/reel/build";
import { canEncodeHere } from "../lib/social/reel/encode";

/**
 * How many unpublished reels to keep on hand.
 *
 * At four reels a week, ten is a fortnight of runway — enough that a failed run, a quiet
 * weekend or a week away does not empty the queue, and few enough that the catalogue is not
 * cut into videos faster than it can be reviewed.
 */
const DEFAULT_TARGET = 10;

/**
 * Ceiling on one run.
 *
 * Encoding is minutes per reel and a CI runner has a wall clock. Building a few per run and
 * letting the schedule catch up is more reliable than one long job that times out halfway and
 * leaves temp files behind.
 */
const DEFAULT_MAX_BUILDS = 3;

function arg(name: string, fallback: number): number {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const n = Number(process.argv[i + 1]);
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : fallback;
}

async function waitingCount(): Promise<number> {
  const sb = createAdminClient();
  const { count, error } = await sb
    .from("social_media_queue")
    .select("id", { count: "exact", head: true })
    .in("status", ["draft", "approved"]);
  if (error) throw new Error(`Could not read the queue: ${error.message}`);
  return count ?? 0;
}

async function main() {
  if (!canEncodeHere()) {
    // Belt and braces. The workflow does not set VERCEL, but a misconfigured environment
    // should say why it did nothing rather than fail three minutes into an encode.
    console.error("This environment cannot encode video (VERCEL is set). Nothing built.");
    process.exit(1);
  }

  const target = arg("target", DEFAULT_TARGET);
  const maxBuilds = arg("max-builds", DEFAULT_MAX_BUILDS);

  const waiting = await waitingCount();
  const shortfall = Math.max(0, target - waiting);
  const toBuild = Math.min(shortfall, maxBuilds);

  console.log(`queue: ${waiting} waiting · target ${target} · building ${toBuild}`);
  if (toBuild === 0) {
    console.log("Nothing to do.");
    return;
  }

  let built = 0;
  const failures: string[] = [];

  for (let i = 0; i < toBuild; i++) {
    try {
      const result = await buildProductReel({
        onProgress: (step) => console.log(`  [${i + 1}/${toBuild}] ${step}`),
      });
      built++;
      console.log(
        `✓ ${result.productTitle} — ${result.durationSeconds}s, ${result.sizeMb}MB`,
      );
    } catch (e) {
      /*
       * One failure does not end the run. The usual cause is a product with too few images
       * for a reel, and the rotation will offer a different one next time round — stopping
       * on the first of those would mean a single awkward product blocks the queue forever.
       */
      const message = (e as Error).message;
      failures.push(message);
      console.error(`✗ build ${i + 1} failed: ${message}`);
    }
  }

  console.log(`\nbuilt ${built}, failed ${failures.length}, queue now ${await waitingCount()}`);

  // Fail the run only if nothing at all was produced. A partial success is still progress,
  // and a red CI badge every time one product lacks images would train everyone to ignore it.
  if (built === 0 && failures.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
