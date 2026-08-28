import { createAdminClient } from "@/lib/supabase/server";
import type { OccasionRow } from "./types";

/**
 * Fresh art direction and a fresh line of meaning, for every occasion poster.
 *
 * Why this exists
 * ---------------
 * `social_occasions.theme` is one fixed string per occasion, and `subtitle` is another. So
 * every Jumma Mubarak asked the image model for "serene ivory and antique gold, fine arabesque
 * border, faint mosque dome" and printed the same sentence underneath. Same input, same
 * poster — the owner deleted one on 2026-08-28 because it was indistinguishable from the
 * previous week's, and they were right to.
 *
 * The row's `theme` is now a *starting point* rather than the instruction. A model writes the
 * actual art direction each time, is shown what the last several looked like, and is told to
 * go somewhere else — a different motif, a different palette within the occasion's register, a
 * different composition.
 *
 * The second half matters as much: the poster now carries something worth reading. A dua for
 * an Islamic day, a line of advice for Mother's Day, a thought for an international day. A
 * greeting alone is a card; a greeting with a dua is something people keep.
 *
 * Fails soft, like everything else here. Null means the caller uses the row's stored `theme`
 * and `subtitle` — the behaviour that predates this file — so a model outage produces last
 * week's poster rather than no poster.
 */

const MODEL = process.env.OPENAI_CAPTION_MODEL?.trim() || "gpt-5.6-terra";
const RECENT_WINDOW = 10;
const TIMEOUT_MS = 45_000;

export type ArtDirection = {
  /** Sent to the image model as the backdrop brief. Never contains text instructions. */
  theme: string;
  /** The dua, quote or line of advice printed on the card. */
  message: string;
  /** Transliteration or attribution, printed smaller beneath. Empty when there is none. */
  attribution: string;
  /** Two or three words naming the visual idea, stored and fed back. */
  motif: string;
};

type Recent = { motifs: string[]; messages: string[]; directions: string[] };

async function loadRecent(slug: string): Promise<Recent> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_generation_log")
    .select("angle, hook, art_direction")
    .eq("stream", "occasion")
    .eq("product_slug", slug)
    .eq("ok", true)
    .order("created_at", { ascending: false })
    .limit(RECENT_WINDOW);

  const rows = data ?? [];
  return {
    motifs: rows.map((r) => r.angle as string).filter(Boolean),
    messages: rows.map((r) => r.hook as string).filter(Boolean),
    directions: rows.map((r) => r.art_direction as string).filter(Boolean),
  };
}

/**
 * What kind of line the day calls for.
 *
 * An Islamic observance wants a dua. Mother's Day wants warmth about mothers, not scripture.
 * An international day wants a thought that earns its place rather than a slogan. Getting this
 * wrong is worse than saying nothing, so it is spelled out per category rather than left to
 * the model to infer from a name.
 */
function messageBrief(occasion: OccasionRow): string {
  switch (occasion.category) {
    case "islamic":
      return `A short, widely-known DUA appropriate to ${occasion.name}.
- Give the English meaning as the message. Keep it to one or two lines.
- Put the Roman transliteration in "attribution", e.g. "Allahumma inni as'aluka..."
- Choose a dua that suits the day: Friday calls for durood, forgiveness, or ease for the week.
- Nothing sectarian, nothing disputed, nothing political. Widely accepted only.
- Do not quote Quranic verses with surah numbers — a misattributed reference on a brand
  account is far worse than a plain, well-known supplication.`;
    case "national":
      return `One dignified line about ${occasion.name} — the country, its people, gratitude.
- No politics, no party, no military imagery, no triumphalism.
- "attribution" stays empty.`;
    default:
      return `One warm, genuinely useful line for ${occasion.name}.
- For Mother's or Father's Day: something true about the relationship, not a greeting-card cliché.
- For an international day: a thought that respects what the day is actually for.
- A short quote is fine if it is real and correctly attributed; put the name in "attribution".
  If you are not certain of the attribution, write the line yourself and leave it empty.`;
  }
}

export async function writeArtDirection(occasion: OccasionRow): Promise<ArtDirection | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  let recent: Recent;
  try {
    recent = await loadRecent(occasion.slug);
  } catch {
    recent = { motifs: [], messages: [], directions: [] };
  }

  const prompt = `You art-direct greeting posters for Habiba Minhas, a women's clothing studio in Karachi. Today's poster is for ${occasion.name}.

THE POSTER
A 1080x1350 card. The brand logo sits large at the top. Below it: the greeting "${occasion.greeting}", then a line worth reading, then the website. There is NO product photograph and no clothing anywhere on it.

WHAT YOU WRITE

1. "theme" — the art direction for a TEXTLESS backdrop. Describe palette, motif, border treatment and mood in two or three sentences. It must leave a large calm centre and upper area clear, because type goes there.
   Register for this occasion: ${occasion.theme}
   Treat that as the *family* the design belongs to, not a template to repeat. Move within it.
   Never ask for text, letters, calligraphy, people, faces, clothing or photography.

2. "message" — ${messageBrief(occasion)}

3. "attribution" — as described above, or "".

4. "motif" — two or three words naming the visual idea, e.g. "crescent and pearls".

VARIETY IS THE POINT
The last posters for this occasion used these motifs. Do NOT reuse them or anything close:
${recent.motifs.length ? recent.motifs.map((m) => `- ${m}`).join("\n") : "- (none yet)"}

These lines have already been used. Choose something different:
${recent.messages.length ? recent.messages.map((m) => `- ${m}`).join("\n") : "- (none yet)"}

And these art directions were already sent to the image model. Go somewhere else — a different motif, a different corner of the palette, a different composition:
${recent.directions.length ? recent.directions.map((d) => `- ${d.slice(0, 160)}`).join("\n") : "- (none yet)"}

Reply with JSON only, no prose and no code fence:
{"theme":"...","message":"...","attribution":"...","motif":"..."}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, input: prompt }),
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
    };
    const text = (body.output ?? [])
      .flatMap((o) => o.content ?? [])
      .filter((c) => c.type === "output_text" && c.text)
      .map((c) => c.text as string)
      .join("")
      .trim();

    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;

    const raw = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

    const theme = str(raw.theme);
    const message = str(raw.message);
    if (theme.length < 20 || message.length < 10) return null;

    return {
      theme,
      message,
      attribution: str(raw.attribution),
      motif: str(raw.motif) || "unlabelled",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Records what was made, so the next poster for this occasion can be told to differ. */
export async function logArtDirection(
  occasion: OccasionRow,
  art: ArtDirection,
): Promise<void> {
  try {
    await createAdminClient().from("social_generation_log").insert({
      stream: "occasion",
      product_slug: occasion.slug,
      hook: art.message,
      angle: art.motif,
      art_direction: art.theme,
      model: MODEL,
      ok: true,
    });
  } catch {
    /* logging must never break publishing */
  }
}
