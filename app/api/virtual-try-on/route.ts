import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getStorefrontSettings } from "@/lib/actions/settings";

export const maxDuration = 60;

const FASHN_BASE = "https://api.fashn.ai/v1";
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 10 * 1024 * 1024;

// ─── GET: health check + optional usage check ─────────────────────────────────

export async function GET(request: NextRequest) {
  const check = new URL(request.url).searchParams.get("check");

  if (check !== "true") {
    return NextResponse.json({ status: "ok", feature: "Virtual Try Room" });
  }

  // Return remaining try count for the authenticated user
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const admin = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [{ count: globalCount }, { count: userCount }, settings] = await Promise.all([
    (admin as ReturnType<typeof createAdminClient>)
      .from("try_on_usage" as never)
      .select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString()),
    (admin as ReturnType<typeof createAdminClient>)
      .from("try_on_usage" as never)
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    getStorefrontSettings(),
  ]);

  const vtr = settings.virtual_try_on;
  if (!vtr.enabled) {
    return NextResponse.json({ error: "Virtual Try Room is currently disabled.", code: "disabled" }, { status: 503 });
  }

  const globalBusy = (globalCount ?? 0) >= vtr.global_daily_limit;
  const remaining = Math.max(0, vtr.per_user_limit - (userCount ?? 0));

  return NextResponse.json({ remaining, globalBusy });
}

// ─── POST: run virtual try-on ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Virtual Try Room is not configured yet. Please try again later." },
      { status: 503 }
    );
  }

  // ── Load settings (limits + global enabled flag) ─────────────────────────────
  const settings = await getStorefrontSettings();
  const vtr = settings.virtual_try_on;

  if (!vtr.enabled) {
    return NextResponse.json(
      { error: "Virtual Try Room is currently disabled. Please check back later.", code: "disabled" },
      { status: 503 }
    );
  }

  // ── Auth check ───────────────────────────────────────────────────────────────
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to use Virtual Try Room." }, { status: 401 });
  }

  const admin = createAdminClient();

  // ── Global daily limit ───────────────────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: globalCount } = await (admin as ReturnType<typeof createAdminClient>)
    .from("try_on_usage" as never)
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  if ((globalCount ?? 0) >= vtr.global_daily_limit) {
    return NextResponse.json(
      { error: "Our virtual fitting room is very busy today — please try again tomorrow.", code: "global_busy" },
      { status: 429 }
    );
  }

  // ── Per-user rolling 24h limit ───────────────────────────────────────────────
  const { count: userCount } = await (admin as ReturnType<typeof createAdminClient>)
    .from("try_on_usage" as never)
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if ((userCount ?? 0) >= vtr.per_user_limit) {
    return NextResponse.json(
      { error: `You've used all ${vtr.per_user_limit} of today's free try-ons. Come back in 24 hours.`, code: "limit_reached" },
      { status: 429 }
    );
  }

  // ── Parse and validate form data ─────────────────────────────────────────────
  try {
    const formData = await request.formData();
    const userFile    = formData.get("userImage")  as File   | null;
    const category    = formData.get("category")   as string | null;
    const productSlug = formData.get("productSlug") as string | null;

    if (!userFile || !productSlug) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Look up the garment image server-side — never trust a URL from the client.
    // Use tryon_image if set (high-quality dedicated asset), otherwise fall back
    // to the first product gallery image.
    const { data: productRow } = await (admin as ReturnType<typeof createAdminClient>)
      .from("products" as never)
      .select("tryon_image, images")
      .eq("slug", productSlug)
      .single() as { data: { tryon_image: string | null; images: string[] } | null };

    const productUrl = productRow?.tryon_image || productRow?.images?.[0] || null;
    if (!productUrl) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }
    if (!ALLOWED_TYPES.includes(userFile.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please use JPG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (userFile.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    // Convert user photo to base64 — stays in memory, never stored
    const userBytes = await userFile.arrayBuffer();
    const userBase64 = `data:${userFile.type};base64,${Buffer.from(userBytes).toString("base64")}`;

    // Fetch the product image on our server and convert to base64.
    // Sending a URL makes fashn.ai fetch it from their side — this can fail
    // silently (CDN blocks, timeouts) and produces a featureless result.
    // Sending raw bytes guarantees fashn.ai always gets the actual image.
    console.log("[virtual-try-on] fetching garment:", productUrl);
    const garmentRes = await fetch(productUrl, { redirect: "follow" });
    if (!garmentRes.ok) {
      console.error("[virtual-try-on] garment fetch failed:", garmentRes.status, garmentRes.statusText);
      return NextResponse.json(
        { error: "Could not load the product image. Please try again." },
        { status: 400 }
      );
    }
    const garmentBytes = await garmentRes.arrayBuffer();
    // Strip any extra params from content-type (e.g. "image/webp; charset=utf-8" → "image/webp")
    const rawMime      = garmentRes.headers.get("content-type") ?? "image/jpeg";
    const garmentMime  = rawMime.split(";")[0].trim() || "image/jpeg";
    const garmentBase64 = `data:${garmentMime};base64,${Buffer.from(garmentBytes).toString("base64")}`;
    console.log("[virtual-try-on] garment fetched —", garmentMime, Math.round(garmentBytes.byteLength / 1024), "KB");
    console.log("[virtual-try-on] user image —", userFile.type, Math.round(userFile.size / 1024), "KB");

    const fashnCategory_ = fashnCategory(category);
    console.log("[virtual-try-on] sending to fashn.ai — category:", fashnCategory_, "mode: quality");

    // Submit try-on job to fashn.ai
    const runRes = await fetch(`${FASHN_BASE}/run`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image:        userBase64,
          garment_image:      garmentBase64,
          category:           fashnCategory_,
          mode:               "quality",
          garment_photo_type: "auto",
          return_base64:      true,
        },
      }),
    });

    if (!runRes.ok) {
      const err = await runRes.text().catch(() => "");
      console.error("[virtual-try-on] fashn.ai submit error:", runRes.status, err);
      if (runRes.status === 401) {
        return NextResponse.json(
          { error: "Virtual Try Room is temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "AI service unavailable. Please try again in a moment." },
        { status: 502 }
      );
    }

    const runBody = (await runRes.json()) as { id?: string; error?: string };
    console.log("[virtual-try-on] fashn.ai job response:", JSON.stringify(runBody));
    const { id } = runBody;
    if (!id) {
      return NextResponse.json(
        { error: "Could not start try-on job. Please try again." },
        { status: 502 }
      );
    }

    // Poll for result — fashn.ai typically completes in 5–17 seconds
    const deadline = Date.now() + 55_000;
    while (Date.now() < deadline) {
      await sleep(3000);

      const statusRes = await fetch(`${FASHN_BASE}/status/${id}`, { headers });
      if (!statusRes.ok) continue;

      const status = (await statusRes.json()) as {
        status: string;
        output?: string | string[];
        error?: string;
      };

      console.log("[virtual-try-on] poll status:", status.status);
      if (status.status === "completed") {
        const raw = Array.isArray(status.output) ? status.output[0] : status.output;
        if (!raw) {
          return NextResponse.json(
            { error: "AI did not return an image. Please try again." },
            { status: 500 }
          );
        }

        // Record successful usage
        await (admin as ReturnType<typeof createAdminClient>)
          .from("try_on_usage" as never)
          .insert({
            user_id:      user.id,
            user_email:   user.email ?? "",
            product_slug: productSlug ?? "unknown",
            category:     category ?? "unknown",
          } as never);

        const remaining = Math.max(0, vtr.per_user_limit - (userCount ?? 0) - 1);

        // Return base64 data URI or download URL as base64
        if (raw.startsWith("data:")) {
          const [meta, b64] = raw.split(",");
          const mime = meta.split(":")[1].split(";")[0];
          return NextResponse.json({ image: b64, mimeType: mime, remaining });
        }

        const imgRes = await fetch(raw);
        if (!imgRes.ok) {
          return NextResponse.json(
            { error: "Could not download result image. Please try again." },
            { status: 502 }
          );
        }
        const imgBuf = await imgRes.arrayBuffer();
        return NextResponse.json({
          image: Buffer.from(imgBuf).toString("base64"),
          mimeType: imgRes.headers.get("content-type") ?? "image/png",
          remaining,
        });
      }

      if (status.status === "failed") {
        const msg = status.error ?? "Try-on failed.";
        console.error("[virtual-try-on] fashn.ai failed:", msg);
        return NextResponse.json(
          { error: "AI could not process this image. Try a clearer, well-lit front-facing photo." },
          { status: 500 }
        );
      }
      // status "starting" | "in_queue" | "processing" — keep polling
    }

    return NextResponse.json(
      { error: "AI is taking too long. Please try again — it is usually faster on retry." },
      { status: 504 }
    );
  } catch (err) {
    console.error("[virtual-try-on]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again in a moment." },
      { status: 500 }
    );
  }
}

function fashnCategory(category: string | null): string {
  switch (category) {
    case "kids-formal":
    case "baby-products":
      return "one-pieces";
    case "accessories":
      return "tops";
    default:
      return "one-pieces";
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
