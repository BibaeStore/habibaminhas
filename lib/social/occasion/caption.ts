/**
 * Captions for occasion posts.
 *
 * These are greetings, not adverts. The owner was explicit: no sizes, no price, no product
 * detail, no delivery or COD terms — "the post is not to advertise my product". A greeting
 * that sells gets shared far less than one that simply greets, so this is good marketing
 * as well as an instruction to follow.
 *
 * The model writes the middle. The greeting line, the website, the hashtags and the shape
 * are fixed here, and `stripBannedTerms` runs over whatever comes back. Prompting alone
 * drifts: asked forty times not to mention price, a model will eventually mention price.
 */
import type { OccasionRow } from "./types";

const SITE = "habibaminhas.com";
const MODEL = "gpt-4o";

/**
 * Terms that must never reach a published greeting.
 *
 * Sizes are first because they were the owner's first instruction, and the standalone
 * "S/M/L" forms are included — a model told not to write "Small" will write "S, M, L".
 */
const BANNED = [
  /\bsmall\b/gi, /\bmedium\b/gi, /\blarge\b/gi,
  /\b(x{0,2}s|x{0,2}l|xl|xxl)\b/g,
  /\bsizes?\b/gi, /\bsizing\b/gi,
  /\bRs\.?\s*[\d,]+/gi, /\b(price|priced|pricing|cost|discount|sale|off)\b/gi,
  /\b(cash on delivery|cod)\b/gi,
  /\b(delivery|deliver|shipping|ships?|courier|exchange|returns?)\b/gi,
  /\b(in stock|stock|order now|buy now|shop now|dm to order)\b/gi,
];

/** Sentences are dropped whole — excising two words leaves copy that reads broken. */
export function stripBannedTerms(text: string): string {
  const kept = text
    .split(/\n/)
    .map((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !BANNED.some((re) => { re.lastIndex = 0; return re.test(sentence); }))
        .join(" ")
        .trim(),
    )
    .join("\n");
  return kept.replace(/\n{3,}/g, "\n\n").trim();
}

/** True when the text is clean. Used as a publish-time assertion, not just a filter. */
export function isCaptionClean(text: string): boolean {
  return !BANNED.some((re) => { re.lastIndex = 0; return re.test(text); });
}

export type OccasionCaptions = {
  instagram: string;
  facebook: string;
  hashtags: string[];
};

const FALLBACK_TAGS = ["#HabibaMinhas", "#PakistaniFashion", "#PakistaniClothing"];

/**
 * Writes the body of the greeting.
 *
 * Kept to two or three short sentences. A greeting is read in a second and a half; the
 * long-form voice used on product pages would be wrong here.
 */
async function writeBody(occasion: OccasionRow): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return occasion.subtitle ?? "";

  const input = `Write a short social media greeting for ${occasion.name}, posted by Habiba Minhas, a women's clothing brand in Karachi, Pakistan.

Rules, all mandatory:
- Two or three short sentences, warm and sincere. No more.
- It is a greeting, NOT an advertisement.
- Never mention: sizes, prices, delivery, shipping, cash on delivery, stock, discounts, or "shop now".
- Do not describe any garment, fabric or product.
- No emoji. No hashtags. No links.
- Plain sentences. No headings, no bullet points, no quotation marks.
- Do not open with the occasion's name — that is already the headline above this text.

Tone: ${occasion.category === "islamic" ? "reverent and calm" : occasion.category === "national" ? "proud and dignified" : "warm and celebratory"}.`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, input }),
    });
    if (!res.ok) return occasion.subtitle ?? "";
    const body = (await res.json()) as {
      output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
    };
    const text = (body.output ?? [])
      .flatMap((o) => o.content ?? [])
      .filter((c) => c.type === "output_text" && c.text)
      .map((c) => c.text as string)
      .join(" ")
      .trim();
    const clean = stripBannedTerms(text);
    // If filtering gutted it, the stored subtitle is a known-good greeting already.
    return clean.length > 30 ? clean : occasion.subtitle ?? "";
  } catch {
    return occasion.subtitle ?? "";
  }
}

/**
 * Builds both captions.
 *
 * They differ because the platforms do. Instagram renders URLs as dead text and rewards a
 * tag block, so it gets the bare domain and the full set. Facebook demotes hashtag-stuffed
 * posts and makes links clickable, so it gets a real URL and two tags.
 */
export async function buildOccasionCaptions(occasion: OccasionRow): Promise<OccasionCaptions> {
  const body = await writeBody(occasion);
  const hashtags = (occasion.hashtags?.length ? occasion.hashtags : FALLBACK_TAGS).slice(0, 15);

  const instagram = [
    occasion.greeting.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase()),
    "",
    body,
    "",
    `Visit us at ${SITE}`,
    "",
    hashtags.join(" "),
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim();

  const facebook = [
    occasion.greeting.replace(/\b\w+/g, (w) => w[0] + w.slice(1).toLowerCase()),
    "",
    body,
    "",
    `Visit us at https://${SITE}/`,
    "",
    hashtags.slice(0, 2).join(" "),
  ].join("\n").replace(/\n{3,}/g, "\n\n").trim();

  return { instagram, facebook, hashtags };
}
