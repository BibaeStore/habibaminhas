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
  /** Heads the card: "Dua for Forgiveness", "For Mothers". */
  cardTitle: string;
  /** Arabic script, verbatim from the library. Empty for non-Islamic occasions. */
  arabic: string;
  /** The English meaning, verbatim from the library. */
  message: string;
  /** Roman transliteration, printed under the Arabic. */
  attribution: string;
  /** Two or three words naming the visual idea, stored and fed back. */
  motif: string;
};

type DuaRow = {
  id: string;
  title: string;
  arabic: string | null;
  transliteration: string | null;
  meaning: string;
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
 * The vetted words this poster may use.
 *
 * The model does not write the dua. It picks one, by id, from what this returns — and the
 * Arabic, transliteration and meaning are then read from the row rather than from the model's
 * reply. That distinction is the entire safeguard.
 *
 * The reference poster the owner shared attributed a well-known istighfar to "Surah An-Nur:
 * 24:31". It is not that verse. A model asked for a dua *and* its source will produce a
 * confident source about as often as a correct one, and a misattributed ayah on a
 * Muslim-audience account is a serious error rather than a typo. Taking the words out of the
 * model's hands makes that class of mistake impossible instead of unlikely.
 */
async function loadLibrary(category: string): Promise<DuaRow[]> {
  const sb = createAdminClient();
  const { data } = await sb
    .from("social_dua_library")
    .select("id, title, arabic, transliteration, meaning")
    .eq("category", category)
    .eq("enabled", true);
  return (data ?? []) as DuaRow[];
}

/** Non-Islamic days have no dua, so the model writes the line itself under a tighter brief. */
function freeformBrief(occasion: OccasionRow): string {
  switch (occasion.category) {
    case "national":
      return `Write ONE dignified line about ${occasion.name} — the country, its people, gratitude.
No politics, no party, no military imagery, no triumphalism. "cardTitle" should be a short
label such as "For Pakistan". Leave "arabic" and "attribution" empty.`;
    default:
      return `Write ONE warm, genuinely useful line for ${occasion.name}.
For Mother's or Father's Day: something true about the relationship, not a greeting-card
cliché. For an international day: a thought that respects what the day is actually for.
"cardTitle" is a short label such as "For Mothers". Leave "arabic" empty. Put a real
attribution in "attribution" only if you are quoting someone and are certain of the name;
otherwise write the line yourself and leave it empty.`;
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

  const library = await loadLibrary(occasion.category);
  const usesLibrary = library.length > 0;

  const prompt = `You art-direct greeting posters for Habiba Minhas, a women's clothing studio in Karachi. Today's poster is for ${occasion.name}.

THE POSTER
A 1080x1080 square. The brand logo sits at the top of the left column, then the greeting "${occasion.greeting}", a short blessing, and ONE card carrying a single dua or message. The right of the frame is a photographic scene. There is NO product and no clothing anywhere on it.

WHAT YOU WRITE

1. "theme" — the art direction for a TEXTLESS backdrop. Describe palette, motif, border treatment and mood in two or three sentences. It must leave a large calm centre and upper area clear, because type goes there.
   Register for this occasion: ${occasion.theme}
   Treat that as the *family* the design belongs to, not a template to repeat. Move within it.
   Never ask for text, letters, calligraphy, people, faces, clothing or photography.

2. ${
    usesLibrary
      ? `"duaId" — CHOOSE ONE entry from the vetted library below and give its id, exactly as written. Do not write the Arabic or the meaning yourself; they are taken from the row you pick. Prefer one that suits the day and that is not in the recently-used list.

${library.map((d) => `   ${d.id}  ${d.title} — ${d.meaning}`).join("\n")}`
      : `"message", "cardTitle", "attribution" — ${freeformBrief(occasion)}`
  }

3. "motif" — two or three words naming the visual idea, e.g. "crescent and pearls".

VARIETY IS THE POINT
The last posters for this occasion used these motifs. Do NOT reuse them or anything close:
${recent.motifs.length ? recent.motifs.map((m) => `- ${m}`).join("\n") : "- (none yet)"}

These lines have already been used. Choose something different:
${recent.messages.length ? recent.messages.map((m) => `- ${m}`).join("\n") : "- (none yet)"}

And these art directions were already sent to the image model. Go somewhere else — a different motif, a different corner of the palette, a different composition:
${recent.directions.length ? recent.directions.map((d) => `- ${d.slice(0, 160)}`).join("\n") : "- (none yet)"}

Reply with JSON only, no prose and no code fence:
${
    usesLibrary
      ? `{"theme":"...","duaId":"...","motif":"..."}`
      : `{"theme":"...","cardTitle":"...","message":"...","attribution":"...","motif":"..."}`
  }`;

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
    if (theme.length < 20) return null;
    const motif = str(raw.motif) || "unlabelled";

    if (usesLibrary) {
      /*
       * The model chose a row; the words come from the row. A hallucinated id falls back to a
       * real entry rather than failing, because a valid dua from the wrong pick is a far
       * better outcome than no poster.
       */
      const chosen = library.find((d) => d.id === str(raw.duaId)) ?? library[0];
      return {
        theme,
        cardTitle: chosen.title,
        arabic: chosen.arabic ?? "",
        message: chosen.meaning,
        attribution: chosen.transliteration ?? "",
        motif,
      };
    }

    const message = str(raw.message);
    if (message.length < 10) return null;
    return {
      theme,
      cardTitle: str(raw.cardTitle),
      arabic: "",
      message,
      attribution: str(raw.attribution),
      motif,
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
