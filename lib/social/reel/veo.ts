/**
 * Video generation with Veo 3.1 Fast.
 *
 * What this is for, and what it is not
 * ------------------------------------
 * This is the *mood opener*, not the garment. Veo re-renders whatever it is shown: embroidery
 * patterns shift, necklines change, a chikankari motif becomes an approximation of one. For a
 * clothing studio that is a returns-and-trust problem, not a cosmetic one — a customer who buys
 * from a reel and receives a garment whose embroidery does not match has been misled, however
 * unintentionally.
 *
 * So the hybrid the owner approved on 2026-08-28: a few seconds of fabric, light and motion
 * from Veo, cut to the real product photography the existing ffmpeg pipeline already produces.
 * The prompt below is written to keep Veo away from the garment's construction for exactly that
 * reason, and `video_safe` on the product row is the owner's per-garment veto.
 *
 * Money
 * -----
 * Veo has no free tier. Every call costs real money the moment it succeeds, so:
 *
 *   - `assertBudget` reads what has actually been spent this calendar month from
 *     `social_generation_log` and refuses before calling out if the ceiling is reached. A
 *     runaway loop cannot empty the account.
 *   - The cost of every attempt is written to the log whether it succeeded or not.
 *   - 8 seconds at 1080p on Fast is $0.96. The owner funded $25/month.
 */
import { createAdminClient } from "@/lib/supabase/server";

/** Confirmed against Google's Veo docs, 2026-08-28. */
const MODEL = process.env.VEO_MODEL?.trim() || "veo-3.1-fast-generate-preview";
const BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Published Veo 3.1 Fast rates, USD per second, audio included. */
const RATE_PER_SECOND: Record<string, number> = { "720p": 0.10, "1080p": 0.12, "4k": 0.30 };

/** The owner's monthly ceiling, in US cents. Overridable without a deploy. */
const MONTHLY_CAP_CENTS = Number(process.env.VEO_MONTHLY_CAP_CENTS || 2500);

/** Veo accepts 4, 6 or 8 seconds only — not an arbitrary duration. */
export type VeoDuration = 4 | 6 | 8;

export type VeoRequest = {
  prompt: string;
  durationSeconds?: VeoDuration;
  resolution?: "720p" | "1080p";
  /** A real product photograph as the first frame, which anchors colour and drape. */
  referenceImage?: { base64: string; mimeType: string };
};

export type VeoResult = {
  /** Signed download URI. Short-lived, so fetch it promptly. */
  uri: string;
  seconds: number;
  costCents: number;
  model: string;
};

export function estimateCostCents(seconds: number, resolution: "720p" | "1080p"): number {
  return Math.round(seconds * (RATE_PER_SECOND[resolution] ?? 0.12) * 100);
}

/** Cents spent on Veo so far this calendar month, from the log rather than a counter. */
export async function spentThisMonthCents(): Promise<number> {
  const sb = createAdminClient();
  const since = new Date();
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);

  const { data } = await sb
    .from("social_generation_log")
    .select("cost_cents")
    .eq("stream", "reel")
    .like("model", "veo%")
    .gte("created_at", since.toISOString());

  return (data ?? []).reduce((sum, r) => sum + Number(r.cost_cents ?? 0), 0);
}

export type BudgetState = { spentCents: number; capCents: number; remainingCents: number };

/**
 * Refuses before spending, not after.
 *
 * Derived from the log rather than a stored counter so it stays correct across redeploys and
 * cannot drift. Checked before every call, including the very first, because a bug that costs
 * money is in a different category from one that does not.
 */
export async function assertBudget(plannedCents: number): Promise<BudgetState> {
  const spentCents = await spentThisMonthCents();
  const remainingCents = MONTHLY_CAP_CENTS - spentCents;
  if (plannedCents > remainingCents) {
    throw new Error(
      `Veo budget reached: $${(spentCents / 100).toFixed(2)} of $${(MONTHLY_CAP_CENTS / 100).toFixed(2)} used this month. ` +
        `This clip needs $${(plannedCents / 100).toFixed(2)}. Raise VEO_MONTHLY_CAP_CENTS to continue.`,
    );
  }
  return { spentCents, capCents: MONTHLY_CAP_CENTS, remainingCents };
}

/**
 * What Veo must not do.
 *
 * Appended to every prompt. The garment constraints are the important half: without them the
 * model happily invents embroidery, and the whole reason for the hybrid approach is that it
 * must not be trusted to reproduce a real one.
 */
const NEGATIVE = [
  "no text, no lettering, no words, no numbers, no watermark, no logos",
  "no distorted hands, no extra limbs, no malformed faces, no face close-ups",
  "do not change the garment's pattern, embroidery or drape; no morphing fabric",
  "no Western clothing, no swimwear, no revealing clothing",
  "no camera shake, no flicker, no sudden cuts",
].join(". ");

type LroResponse = {
  name?: string;
  done?: boolean;
  error?: { message?: string };
  response?: {
    generateVideoResponse?: {
      generatedSamples?: Array<{ video?: { uri?: string } }>;
    };
  };
};

/**
 * Generates one clip and waits for it.
 *
 * Veo is a long-running operation: the first call returns an operation name and the video is
 * polled for. Generation takes one to three minutes, which is why this belongs in the CI reel
 * job and not in a request handler.
 *
 * `9:16` is passed explicitly and the result is *not* trusted — developers have reported the API
 * returning 16:9 regardless. The caller must verify the actual dimensions of what comes back
 * before publishing it as a reel, which is precisely what the trial script does.
 */
export async function generateClip(req: VeoRequest): Promise<VeoResult> {
  const key = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const seconds: VeoDuration = req.durationSeconds ?? 8;
  const resolution = req.resolution ?? "1080p";
  const costCents = estimateCostCents(seconds, resolution);

  await assertBudget(costCents);

  const instance: Record<string, unknown> = { prompt: `${req.prompt}\n\nAvoid: ${NEGATIVE}` };
  if (req.referenceImage) {
    instance.image = {
      bytesBase64Encoded: req.referenceImage.base64,
      mimeType: req.referenceImage.mimeType,
    };
  }

  const start = await fetch(`${BASE}/models/${MODEL}:predictLongRunning`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        aspectRatio: "9:16",
        resolution,
        durationSeconds: String(seconds),
      },
    }),
  });

  if (!start.ok) {
    throw new Error(`Veo start failed (${start.status}): ${(await start.text()).slice(0, 400)}`);
  }

  const op = (await start.json()) as LroResponse;
  if (!op.name) throw new Error("Veo returned no operation name");

  /*
   * Poll for up to six minutes. Generation is typically 1-3, and a clip that has not appeared in
   * six is not going to: better to fail with a clear message than leave a CI job hanging until
   * its own timeout kills it with none.
   */
  const deadline = Date.now() + 6 * 60_000;
  let attempt = 0;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, attempt === 0 ? 15_000 : 10_000));
    attempt++;

    const poll = await fetch(`${BASE}/${op.name}`, { headers: { "x-goog-api-key": key } });
    if (!poll.ok) continue; // a transient 5xx should not abandon a clip already being paid for

    const state = (await poll.json()) as LroResponse;
    if (state.error?.message) throw new Error(`Veo failed: ${state.error.message}`);
    if (!state.done) continue;

    const uri = state.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (!uri) throw new Error("Veo reported done but returned no video URI");

    return { uri, seconds, costCents, model: MODEL };
  }

  throw new Error(`Veo did not finish within 6 minutes (operation ${op.name})`);
}

/** Downloads the finished clip. The URI is signed and needs the API key. */
export async function downloadClip(uri: string): Promise<Buffer> {
  const key = process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
  const res = await fetch(uri, { headers: { "x-goog-api-key": key ?? "" } });
  if (!res.ok) throw new Error(`Veo download failed (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

/** Records the spend, successful or not, so the budget check stays honest. */
export async function logVeoSpend(input: {
  ok: boolean;
  costCents: number;
  model: string;
  productSlug?: string | null;
  prompt?: string;
  error?: string;
}): Promise<void> {
  try {
    await createAdminClient().from("social_generation_log").insert({
      stream: "reel",
      product_slug: input.productSlug ?? null,
      art_direction: input.prompt?.slice(0, 1200) ?? null,
      model: input.model,
      cost_cents: input.costCents,
      ok: input.ok,
      error: input.error ?? null,
    });
  } catch {
    /* logging must never break the pipeline */
  }
}
