/**
 * The Veo trial: three clips, judged by eye, before any of it is trusted in production.
 *
 * Two questions this exists to answer, neither of which documentation can settle:
 *
 *   1. **Does the API actually return 9:16?** Developers have reported it forcing 16:9 despite
 *      the parameter. Instagram Reels require vertical. This script measures the real dimensions
 *      of what comes back rather than believing the request.
 *
 *   2. **Does the output stay far enough from the garment to be honest?** Veo re-renders what it
 *      sees. The clips here are deliberately *mood* — fabric, light, motion — and the point is to
 *      look at them beside the real photographs and decide whether that separation holds.
 *
 * Costs real money: 3 clips at 8s 1080p on Fast is about $2.88. `assertBudget` refuses if the
 * monthly ceiling is reached, and every attempt is logged whether it succeeds or not.
 *
 *   npx tsx --env-file=.env.local scripts/veo-trial.ts
 *   npx tsx --env-file=.env.local scripts/veo-trial.ts --dry     # prompts only, spends nothing
 */
import { writeFileSync } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { getSocialSettings } from "../lib/social/config";
import { selectNextProducts } from "../lib/social/select";
import {
  generateClip, downloadClip, logVeoSpend, estimateCostCents, spentThisMonthCents,
} from "../lib/social/reel/veo";

const run = promisify(execFile);
const DRY = process.argv.includes("--dry");

/**
 * Three briefs, deliberately different in what they risk.
 *
 * A is the safest — no garment at all. C is closest to a conventional product reel and therefore
 * the one most likely to invent embroidery. Rendering all three is the only way to see where the
 * honest line actually falls rather than guessing at it.
 */
function briefs(p: { title: string; fabric: string; colour: string }) {
  return [
    {
      name: "A-fabric",
      risk: "lowest — no garment in frame",
      prompt:
        `Extreme close macro of ${p.fabric} in ${p.colour}, lit by soft morning window light. ` +
        `The fabric lifts and settles slowly in a faint breeze; light rakes across the weave and ` +
        `the shadows shift. Shallow depth of field, the far edge falling out of focus. ` +
        `Camera: a slow 8-second dolly left, no cuts. Warm ivory and gold ambience. ` +
        `Nothing but fabric, light and air — no garment shape, no person, no room.`,
    },
    {
      name: "B-atelier",
      risk: "low — the room, not the clothes",
      prompt:
        `A quiet Karachi atelier at golden hour. Dust drifting in a shaft of light, a wooden ` +
        `table with thread spools and folded ${p.colour} ${p.fabric} at the far edge, a brass ` +
        `lamp, sheer curtain moving gently at a window. Camera: a slow 8-second push in toward ` +
        `the folded cloth, settling. Photoreal, calm, editorial, warm ivory palette. No people.`,
    },
    {
      name: "C-drape",
      risk: "highest — a garment on a form, most likely to invent detail",
      prompt:
        `${/^[aeiou]/.test(p.colour) ? "An" : "A"} ${p.colour} ${p.fabric} garment on a plain tailor's dress form in a bright studio, ` +
        `seen from the waist down only. The hem and dupatta move gently in a soft breeze. ` +
        `Camera: a slow 8-second tilt up the drape, stopping below the shoulder. Even daylight, ` +
        `pale grey background. Photoreal. No face, no head, no hands, no printed pattern.`,
    },
  ];
}

/**
 * Actual pixel dimensions of the file. The whole point of the trial.
 *
 * Read with ffmpeg, not ffprobe: `ffmpeg-static` ships only the one binary, and assuming
 * ffprobe was there cost a run. ffmpeg writes stream info to stderr and exits non-zero when
 * given no output file, so the "error" path is the success path here.
 */
async function dimensions(path: string): Promise<string> {
  try {
    const ffmpeg = (await import("ffmpeg-static")).default as unknown as string;
    let text = "";
    try {
      await run(ffmpeg, ["-i", path]);
    } catch (e) {
      text = String((e as { stderr?: string }).stderr ?? "");
    }
    const stream = /Stream #.*Video:.*?(\d{3,4})x(\d{3,4})/.exec(text);
    const dur = /Duration: ([0-9:.]+)/.exec(text);
    if (!stream) return "could not read dimensions";
    const [w, h] = [Number(stream[1]), Number(stream[2])];
    return `${w}x${h} ${dur ? dur[1] : ""} ${h > w ? "✓ VERTICAL" : "✗ NOT VERTICAL"}`;
  } catch (e) {
    return `could not probe: ${(e as Error).message}`;
  }
}

async function main() {
  const settings = await getSocialSettings();
  if (!settings) throw new Error("social_settings row missing");

  const { products } = await selectNextProducts(settings, 1, "carousel");
  const product = products[0];
  if (!product) throw new Error("no eligible product");

  /*
   * Pulled from the product's own words, same discipline as the captions.
   *
   * The colour must come from a colour word, not from the product name: splitting the title on
   * the dash gave "emerald grace", which is the name of the garment. Asking a video model for
   * "emerald grace chiffon" invites it to invent whatever it thinks that means.
   */
  const text = `${product.title} ${product.short_description ?? ""}`.toLowerCase();
  const COLOURS = [
    "off-white", "white", "ivory", "cream", "emerald", "olive", "sage", "teal", "navy",
    "royal blue", "sky blue", "blue", "lilac", "lavender", "purple", "maroon", "burgundy",
    "coral", "peach", "blush", "tea pink", "pink", "rose", "red", "marigold", "mustard",
    "orange", "yellow", "gold", "beige", "sand", "grey", "black", "green",
  ];
  const colour = COLOURS.find((c) => text.includes(c)) ?? "ivory";

  const specs = (product.short_description ?? "").toLowerCase();
  const fabric = /chiffon/.test(specs) ? "chiffon" : /organza/.test(specs) ? "organza"
    : /lawn/.test(specs) ? "lawn cotton" : /net/.test(specs) ? "fine net" : "soft cotton";

  const list = briefs({ title: product.title, fabric, colour });
  const perClip = estimateCostCents(8, "1080p");

  console.log(`product : ${product.title}`);
  console.log(`fabric  : ${fabric} · colour: ${colour}`);
  console.log(`spent   : $${((await spentThisMonthCents()) / 100).toFixed(2)} this month`);
  console.log(`this run: $${((perClip * list.length) / 100).toFixed(2)} for ${list.length} clips\n`);

  if (DRY) {
    for (const b of list) {
      console.log(`--- ${b.name} (${b.risk}) ---\n${b.prompt}\n`);
    }
    console.log("Dry run — nothing generated, nothing spent.");
    return;
  }

  for (const b of list) {
    process.stdout.write(`${b.name}… `);
    try {
      const clip = await generateClip({ prompt: b.prompt, durationSeconds: 8, resolution: "1080p" });
      const bytes = await downloadClip(clip.uri);
      const path = `veo-${b.name}.mp4`;
      writeFileSync(path, bytes);
      await logVeoSpend({ ok: true, costCents: clip.costCents, model: clip.model,
                          productSlug: product.slug, prompt: b.prompt });
      console.log(
        `ok  ${(bytes.length / 1024 / 1024).toFixed(2)}MB  $${(clip.costCents / 100).toFixed(2)}  ` +
        `dims=${await dimensions(path)}`,
      );
    } catch (e) {
      const msg = (e as Error).message;
      // Budget refusals cost nothing, so they are not logged as spend.
      if (!/budget reached/i.test(msg)) {
        await logVeoSpend({ ok: false, costCents: 0, model: "veo-3.1-fast-generate-preview",
                            productSlug: product.slug, prompt: b.prompt, error: msg });
      }
      console.log(`FAILED: ${msg}`);
    }
  }

  console.log(`\nspent now: $${((await spentThisMonthCents()) / 100).toFixed(2)}`);
  console.log("dims are width,height,duration — the height must be the LARGER number for 9:16.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
