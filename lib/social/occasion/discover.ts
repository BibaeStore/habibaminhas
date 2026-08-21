/**
 * The only place this agent touches the internet.
 *
 * Its job is narrow on purpose. It resolves the handful of occasions whose dates genuinely
 * cannot be computed — Eid, Ramadan, Milad un-Nabi — and nothing else. It does not decide
 * what is worth posting about.
 *
 * That distinction is the whole safety design. Asked "what is 21 August 2026", web search
 * answers "International Day of Remembrance and Tribute to the Victims of Terrorism". An
 * agent that posted whatever the internet called today would have put a styled photograph
 * of a white suit under that heading. So the question this module is allowed to ask is
 * "when is Eid this year", never "what should we post today".
 *
 * `isSafeOccasionName` exists as a second line of defence for the day someone adds a row
 * to `social_occasions` by hand without thinking it through.
 */
import type { OccasionRow } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-4o";

/**
 * Subjects this brand must never publish a styled greeting against.
 *
 * Mourning, disease, disaster, conflict and politics. The list is intentionally blunt and
 * intentionally in code rather than in a table — a safety rule that can be edited away
 * through the admin UI by accident is not a safety rule.
 */
const DENY_PATTERNS: RegExp[] = [
  /\b(victim|victims|massacre|genocide|holocaust|martyr|martyrs|mourning|tragedy|tragic)\b/i,
  /\b(terror|terrorism|terrorist|war|conflict|violence|shooting|bombing|attack)\b/i,
  /\b(death|died|deceased|funeral|memorial|remembrance|condolence|grief)\b/i,
  /\b(cancer|aids|hiv|disease|illness|suicide|abuse|trafficking|famine|refugee)\b/i,
  /\b(earthquake|flood|disaster|emergency|crisis|pandemic|epidemic)\b/i,
  /\b(election|political|protest|strike|boycott|sanction)\b/i,
];

/** True when a name is safe for a celebratory brand greeting. */
export function isSafeOccasionName(name: string): boolean {
  return !DENY_PATTERNS.some((re) => re.test(name));
}

/**
 * Which lunar occasions still need a date for a given year.
 *
 * Returns only rows that are lunar, enabled and not already resolved, so a normal run
 * makes no network call at all — this fires roughly once a year per occasion.
 */
export function unresolvedLunar(occasions: OccasionRow[], year: number): OccasionRow[] {
  return occasions.filter(
    (o) => o.recurrence === "lunar" && o.enabled && !o.resolved_dates?.[String(year)],
  );
}

export type ResolvedDate = {
  slug: string;
  date: string | null;
  confidence: "high" | "low";
  note: string;
};

/**
 * Asks the web for this year's date for each named occasion, as observed in Pakistan.
 *
 * Pakistan is stated explicitly because Eid is frequently a day later there than in Saudi
 * Arabia, and a greeting that lands a day early reads as careless to the entire audience.
 *
 * `confidence` matters more than it looks. Islamic dates are announced by moon sighting
 * days beforehand, so a date fetched months ahead is an astronomical estimate, not a fact.
 * Low-confidence answers are still stored — the planner needs something to show in the
 * calendar — but the caller re-checks them close to the date.
 */
export async function resolveLunarDates(
  occasions: OccasionRow[],
  year: number,
): Promise<ResolvedDate[]> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || occasions.length === 0) return [];

  const wanted = occasions.map((o) => `- ${o.slug}: ${o.name}`).join("\n");
  const input = `For the calendar year ${year}, find the date each of these Islamic occasions is observed **in Pakistan**:

${wanted}

Pakistan often observes Eid one day later than Saudi Arabia because of local moon sighting. Use the Pakistani date.

Reply with ONLY a JSON array, no prose and no markdown fence, shaped exactly:
[{"slug":"<slug>","date":"YYYY-MM-DD","confidence":"high|low","note":"<short source or caveat>"}]

Use confidence "high" only if the date is officially announced or confirmed. Use "low" if it is an astronomical projection that moon sighting could shift. If you cannot find a date, use null for date.`;

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: MODEL, tools: [{ type: "web_search" }], input }),
    });
    if (!res.ok) return [];

    const body = (await res.json()) as {
      output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
    };
    const text = (body.output ?? [])
      .flatMap((o) => o.content ?? [])
      .filter((c) => c.type === "output_text" && c.text)
      .map((c) => c.text as string)
      .join("\n");

    // The model is asked for bare JSON but will occasionally fence it anyway.
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];

    const parsed = JSON.parse(match[0]) as ResolvedDate[];
    const allowed = new Set(occasions.map((o) => o.slug));

    return parsed.filter(
      (r) =>
        allowed.has(r.slug) &&
        (r.date === null || /^\d{4}-\d{2}-\d{2}$/.test(r.date)) &&
        // A date outside the year asked for means the model drifted; drop rather than trust.
        (r.date === null || r.date.startsWith(String(year))),
    );
  } catch {
    // A failed lookup must never break the run. The occasion simply stays unresolved and
    // does not fire, which `occursOn` already handles.
    return [];
  }
}
