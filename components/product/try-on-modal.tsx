"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Upload,
  Sparkles,
  Lock,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  LogIn,
  Clock,
  CalendarX,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type ModalState =
  | "checking"
  | "needsLogin"
  | "upload"
  | "loading"
  | "result"
  | "limitReached"
  | "globalBusy"
  | "error";

interface Props {
  productImage: string;
  productTitle: string;
  productSlug: string;
  category: string;
  onClose: () => void;
}

// ─── Category config ──────────────────────────────────────────────────────────

interface CategoryConfig {
  icon: string;
  label: string;
  guidance: string;
  uploadLabel: string;
  ctaText: string;
  tips: string[];
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "ladies-suits": {
    icon: "👗",
    label: "Ladies Outfit",
    guidance:
      "For the best result, upload a clear photo of yourself (a woman). Uploading a different person's photo will give unexpected results.",
    uploadLabel: "Upload Your Photo",
    ctaText: "See Yourself in This Look",
    tips: [
      "Clear, well-lit front-facing photo works best",
      "Full body or upper body — not just your face",
      "Plain or simple background preferred",
      "Avoid dark, blurry, or far-away photos",
    ],
  },
  "kids-formal": {
    icon: "👦",
    label: "Kids Outfit",
    guidance:
      "For the best result, upload a clear photo of your child. Uploading an adult's photo will show incorrect sizing and fit.",
    uploadLabel: "Upload Your Child's Photo",
    ctaText: "See Your Child in This Look",
    tips: [
      "Full body photo of your child works best",
      "Good natural lighting makes a big difference",
      "Child should be facing the camera clearly",
      "Avoid group photos — just your child alone",
    ],
  },
};

const FALLBACK_CONFIG: CategoryConfig = CATEGORY_CONFIG["ladies-suits"];

// ─── Loading messages ─────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Setting up your virtual fitting room...",
  "Placing the outfit on your photo...",
  "Matching the fabric and embroidery...",
  "Fitting the dupatta to your figure...",
  "Almost there — refining the details...",
  "Your look is nearly ready...",
];

// ─── Error helper ─────────────────────────────────────────────────────────────

function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.length < 300) return msg;
  return "AI could not generate a result. Try a clearer, well-lit, front-facing photo and try again.";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TryOnModal({
  productImage,
  productTitle,
  productSlug,
  category,
  onClose,
}: Props) {
  const config = CATEGORY_CONFIG[category] ?? FALLBACK_CONFIG;

  const [modalState, setModalState] = useState<ModalState>("checking");
  const [userFile, setUserFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [triesLeft, setTriesLeft] = useState<number | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Auth + limit check — called on mount AND after popup sign-in ─────────

  const checkAuthAndLimits = useCallback(async () => {
    setModalState("checking");
    // Create a fresh client instance each call — avoids cached null-session from
    // before the user logged in.
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setModalState("needsLogin");
      return;
    }

    try {
      const res = await fetch("/api/virtual-try-on?check=true");
      if (res.status === 401) { setModalState("needsLogin"); return; }
      const data = (await res.json()) as { remaining?: number; globalBusy?: boolean };
      if (data.globalBusy) { setModalState("globalBusy"); return; }
      if ((data.remaining ?? 0) === 0) { setModalState("limitReached"); return; }
      setTriesLeft(data.remaining ?? null);
      setModalState("upload");
    } catch {
      // Network error — let them reach the upload screen; limits enforced server-side
      setModalState("upload");
    }
  }, []);

  useEffect(() => {
    checkAuthAndLimits();
  }, [checkAuthAndLimits]);

  // ─── Lock body scroll ────────────────────────────────────────────────────────

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ─── Escape key ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ─── Rotate loading messages ─────────────────────────────────────────────────

  useEffect(() => {
    if (modalState !== "loading") return;
    const id = setInterval(
      () => setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      2500
    );
    return () => clearInterval(id);
  }, [modalState]);

  // ─── Progress bar ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (modalState !== "loading") return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return 90;
        const step = p < 50 ? 2.5 : p < 75 ? 1 : 0.4;
        return Math.min(90, p + step);
      });
    }, 300);
    return () => clearInterval(id);
  }, [modalState]);

  // ─── Revoke object URL ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ─── File handling ───────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    setFileError("");
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setFileError("Please upload a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError("Photo must be under 10 MB. Please use a smaller image.");
      return;
    }
    setUserFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  // ─── Google sign-in via popup (no full-page redirect) ───────────────────────

  async function handleGoogleSignIn() {
    setSigningIn(true);
    const supabase = createClient();

    // Get the OAuth URL without auto-navigating the main window
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?popup=1`,
        skipBrowserRedirect: true,
      },
    });

    if (error || !data.url) {
      setSigningIn(false);
      return;
    }

    // Open Google sign-in in a small popup window
    const popup = window.open(
      data.url,
      "GoogleSignIn",
      "width=520,height=640,scrollbars=yes,resizable=yes,left=200,top=100"
    );

    if (!popup) {
      // Popup blocked (common on mobile) — fall back to full-page redirect
      setSigningIn(false);
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            window.location.pathname + "?tryon=1"
          )}`,
        },
      });
      // Page navigates away — no further code runs
      return;
    }

    // Wait for the popup to complete and report back
    let handled = false;

    function finish() {
      if (handled) return;
      handled = true;
      clearInterval(pollId);
      window.removeEventListener("message", onMessage);
      setSigningIn(false);
      checkAuthAndLimits();
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data === "auth:success") finish();
    }

    // Poll for popup being closed (covers cases where postMessage is blocked)
    const pollId = setInterval(() => {
      if (popup.closed) finish();
    }, 500);

    window.addEventListener("message", onMessage);
  }

  // ─── Generate try-on ─────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!userFile) return;
    setModalState("loading");
    setMsgIndex(0);
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append("userImage", userFile);
      fd.append("productSlug", productSlug);
      fd.append("category", category);

      const res = await fetch("/api/virtual-try-on/", {
        method: "POST",
        body: fd,
      });

      let data: {
        image?: string;
        mimeType?: string;
        error?: string;
        code?: string;
        remaining?: number;
      };
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server error ${res.status}. Please try again.`);
      }

      if (res.status === 401) { setModalState("needsLogin"); return; }
      if (res.status === 429) {
        setModalState(data.code === "global_busy" ? "globalBusy" : "limitReached");
        return;
      }
      if (!res.ok || !data.image) {
        throw new Error(data.error ?? `Server error ${res.status}. Please try again.`);
      }

      setProgress(100);
      if (data.remaining !== undefined) setTriesLeft(data.remaining);
      setResultImage(`data:${data.mimeType ?? "image/jpeg"};base64,${data.image}`);
      setModalState("result");
    } catch (err) {
      console.error("[VirtualTryRoom]", err);
      setErrorMsg(friendlyError(err));
      setModalState("error");
    }
  }

  // ─── Reset to upload ──────────────────────────────────────────────────────────

  function reset() {
    setUserFile(null);
    setPreviewUrl(null);
    setResultImage(null);
    setErrorMsg("");
    setFileError("");
    setProgress(0);
    setMsgIndex(0);
    setModalState("upload");
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/80 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-fade-up relative flex w-full max-w-2xl flex-col bg-ivory shadow-[0_32px_80px_rgba(26,22,18,0.3)] sm:max-h-[90vh] max-h-[96vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-start justify-between border-b border-border-soft bg-ivory px-5 py-4 sm:px-7">
          <div>
            <span className="text-[10px] uppercase tracking-[0.32em] text-gold-dark">
              ✦ Virtual Try Room
            </span>
            <h2 className="mt-1 font-display text-xl font-light italic leading-snug text-ink sm:text-2xl">
              {productTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Virtual Try Room"
            className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center text-muted transition-colors hover:bg-cream hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Privacy banner ──────────────────────────────────────────── */}
        <div className="flex shrink-0 items-start gap-2.5 border-b border-border-soft bg-cream/60 px-5 py-3 sm:px-7">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
          <p className="text-[11px] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">Your privacy is protected.</strong>{" "}
            Your photo is sent securely to our AI server for processing and is{" "}
            <strong className="font-semibold">never stored</strong> on our servers
            or database. It disappears the moment you close this window.
          </p>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="overflow-y-auto">

          {/* ── CHECKING STATE ──────────────────────────────────────── */}
          {modalState === "checking" && (
            <div className="flex flex-col items-center gap-4 px-7 py-14">
              <div className="relative flex h-12 w-12 items-center justify-center">
                <div className="absolute h-12 w-12 rounded-full border-2 border-parchment" />
                <div className="absolute h-12 w-12 animate-spin rounded-full border-2 border-transparent border-t-gold-dark" />
                <span className="text-sm text-gold-dark">✦</span>
              </div>
              <p className="text-[12px] text-muted">Setting up your fitting room…</p>
            </div>
          )}

          {/* ── NEEDS LOGIN STATE ────────────────────────────────────── */}
          {modalState === "needsLogin" && (
            <div className="flex flex-col items-center gap-6 px-7 py-10 text-center sm:py-14">
              <div className="flex h-14 w-14 items-center justify-center border border-border-soft bg-cream">
                <LogIn className="h-6 w-6 text-ink-soft" />
              </div>
              <div>
                <p className="font-display text-xl font-light italic text-ink">
                  Sign in to try on
                </p>
                <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
                  Create a free account or sign in with Google to use the Virtual Try Room.
                  You get <strong className="text-ink">3 free try-ons every 24 hours</strong>.
                </p>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-3">
                {/* Google sign-in — opens a small popup, does NOT navigate away */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                  className="flex h-12 w-full items-center justify-center gap-3 border border-ink/20 bg-white text-[12px] font-medium tracking-wide text-ink transition-colors hover:border-ink hover:bg-cream disabled:opacity-60"
                >
                  {signingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
                      <span className="text-[12px] text-ink">Signing you in…</span>
                    </>
                  ) : (
                    <>
                      {/* Google G logo */}
                      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>

                <div className="relative flex items-center gap-3">
                  <div className="h-px flex-1 bg-border-soft" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted">or</span>
                  <div className="h-px flex-1 bg-border-soft" />
                </div>

                <a
                  href={`/account/login?redirect=${encodeURIComponent(window.location.pathname + "?tryon=1")}`}
                  className="flex h-12 w-full items-center justify-center border border-ink text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-ink hover:text-ivory"
                >
                  Sign in with Email
                </a>
                <a
                  href={`/account/signup?redirect=${encodeURIComponent(window.location.pathname + "?tryon=1")}`}
                  className="flex h-12 w-full items-center justify-center border border-ink/20 text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:border-ink"
                >
                  Create Free Account
                </a>
              </div>

              <p className="text-[10px] text-muted">
                Free forever &nbsp;·&nbsp; No credit card needed
              </p>
            </div>
          )}

          {/* ── UPLOAD STATE ────────────────────────────────────────── */}
          {modalState === "upload" && (
            <div className="space-y-5 p-5 sm:p-7">
              {/* Tries remaining */}
              {triesLeft !== null && (
                <div className="flex items-center justify-between border border-gold-dark/20 bg-gold-dark/5 px-4 py-2.5">
                  <span className="text-[11px] text-ink-soft">Free try-ons today</span>
                  <span className="text-[12px] font-semibold text-ink">
                    {triesLeft} of 3 remaining
                  </span>
                </div>
              )}

              {/* Category guidance */}
              <div className="flex items-start gap-3 border border-gold-dark/25 bg-gold-dark/5 px-4 py-3">
                <span className="mt-0.5 text-lg leading-none">{config.icon}</span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-dark">
                    {config.label}
                  </p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                    {config.guidance}
                  </p>
                </div>
              </div>

              {/* Photo tips */}
              <div>
                <p className="mb-2.5 text-[10px] uppercase tracking-[0.3em] text-muted">
                  Tips for the best result
                </p>
                <ul className="space-y-2">
                  {config.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-[12px] text-ink-soft">
                      <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-dark" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Drop zone */}
              <div
                role="button"
                tabIndex={0}
                aria-label={config.uploadLabel}
                className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center border-2 border-dashed px-6 py-8 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-dark ${
                  isDragging
                    ? "border-gold-dark bg-gold-dark/5"
                    : previewUrl
                    ? "border-gold-dark/60 bg-gold-dark/5"
                    : "border-border-soft hover:border-ink/40 hover:bg-cream/40"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Your selected photo"
                      className="max-h-44 max-w-full object-contain"
                    />
                    <p className="text-[11px] text-ink-soft">
                      Photo selected &mdash; tap to change
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-7 w-7 text-muted" />
                    <p className="text-[13px] font-medium text-ink">{config.uploadLabel}</p>
                    <p className="text-[11px] text-muted">Drag & drop or tap to browse</p>
                    <p className="mt-1 text-[10px] text-muted">
                      JPG · PNG · WebP &nbsp;·&nbsp; Max 10 MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* File error */}
              {fileError && (
                <div className="flex items-center gap-2 text-[12px] text-sale">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {fileError}
                </div>
              )}

              {/* CTA */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!userFile}
                className="flex h-12 w-full items-center justify-center gap-2 bg-ink text-[11px] uppercase tracking-[0.3em] text-ivory transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4" />
                {userFile ? config.ctaText : "Upload a Photo to Continue"}
              </button>
            </div>
          )}

          {/* ── LOADING STATE ────────────────────────────────────────── */}
          {modalState === "loading" && (
            <div className="flex flex-col items-center gap-7 px-7 py-10 sm:py-14">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden border border-border-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={productImage} alt={productTitle} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.26em] text-muted">Styling you in</p>
                  <p className="mt-0.5 font-display text-base italic text-ink">{productTitle}</p>
                </div>
              </div>

              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute h-16 w-16 rounded-full border-2 border-parchment" />
                <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-gold-dark" />
                <span className="text-base text-gold-dark">✦</span>
              </div>

              <div className="min-h-[1.75rem] text-center">
                <p key={msgIndex} className="animate-fade-up text-[13px] italic text-ink-soft">
                  {LOADING_MESSAGES[msgIndex]}
                </p>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <div className="h-px w-full overflow-hidden bg-border-soft">
                  <div
                    className="h-full bg-gold-dark transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-[10px] uppercase tracking-[0.26em] text-muted">
                  AI is working &nbsp;·&nbsp; Please wait
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-muted">
                <Lock className="h-3 w-3 shrink-0" />
                Your photo is not being saved anywhere
              </div>
            </div>
          )}

          {/* ── RESULT STATE ─────────────────────────────────────────── */}
          {modalState === "result" && resultImage && (
            <div className="space-y-5 p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted">Your Photo</p>
                  <div className="aspect-[3/4] overflow-hidden bg-cream">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl!} alt="Your photo" className="h-full w-full object-cover" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted">Wearing This Look</p>
                  <div
                    className="relative aspect-[3/4] select-none overflow-hidden bg-cream"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultImage}
                      alt="Virtual try-on result"
                      draggable={false}
                      className="pointer-events-none h-full w-full select-none object-cover"
                    />
                    <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()} />
                    <div className="pointer-events-none absolute bottom-2 right-2 z-20 select-none">
                      <span className="text-[9px] uppercase tracking-[0.16em] text-white/55 drop-shadow-sm">
                        habibaminhas.com
                      </span>
                    </div>
                    <div className="pointer-events-none absolute left-2 top-2 z-20 select-none">
                      <span className="bg-ink/65 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-ivory">
                        AI Preview
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center text-[11px] leading-relaxed text-muted">
                AI-generated preview. Shirt and trousers are closely matched to the product.
                Dupatta draping may vary slightly — the actual dupatta color and embroidery
                are as shown on the product page.
              </p>

              {triesLeft !== null && triesLeft > 0 && (
                <p className="text-center text-[11px] text-muted">
                  {triesLeft} free try-on{triesLeft !== 1 ? "s" : ""} remaining today
                </p>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted">
                <Lock className="h-3 w-3 shrink-0" />
                This image is not saved anywhere and disappears when you close this
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="flex h-12 flex-1 items-center justify-center gap-2 border border-ink text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-ink hover:text-ivory"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Another Photo
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 flex-1 items-center justify-center bg-ink text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
                >
                  Shop This Look
                </button>
              </div>
            </div>
          )}

          {/* ── LIMIT REACHED STATE ──────────────────────────────────── */}
          {modalState === "limitReached" && (
            <div className="flex flex-col items-center gap-6 px-7 py-10 text-center sm:py-14">
              <div className="flex h-14 w-14 items-center justify-center border border-border-soft bg-cream">
                <Clock className="h-6 w-6 text-ink-soft" />
              </div>
              <div>
                <p className="font-display text-xl font-light italic text-ink">
                  That&apos;s your 3 for today
                </p>
                <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
                  You&apos;ve used all 3 of today&apos;s free try-ons. Your allowance resets
                  in 24 hours — come back tomorrow!
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-3">
                <a
                  href={`https://wa.me/923120295812?text=${encodeURIComponent(`Hi, I tried on "${productTitle}" using the Virtual Try Room and love it! Can I get more details?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 border border-[#25D366] bg-[#25D366] text-[11px] uppercase tracking-[0.26em] text-white transition-colors hover:bg-[#20BA5A]"
                >
                  Ask Us on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 w-full items-center justify-center border border-ink/20 text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:border-ink"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* ── GLOBAL BUSY STATE ────────────────────────────────────── */}
          {modalState === "globalBusy" && (
            <div className="flex flex-col items-center gap-6 px-7 py-10 text-center sm:py-14">
              <div className="flex h-14 w-14 items-center justify-center border border-border-soft bg-cream">
                <CalendarX className="h-6 w-6 text-ink-soft" />
              </div>
              <div>
                <p className="font-display text-xl font-light italic text-ink">
                  Fitting room is full today
                </p>
                <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-ink-soft">
                  Our virtual fitting room has been fully booked today. Try again tomorrow,
                  or WhatsApp us for help choosing your look.
                </p>
              </div>
              <div className="flex w-full max-w-xs flex-col gap-3">
                <a
                  href={`https://wa.me/923120295812?text=${encodeURIComponent(`Hi, I wanted to try on "${productTitle}" but the Virtual Try Room is full today. Can you help?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-full items-center justify-center gap-2 border border-[#25D366] bg-[#25D366] text-[11px] uppercase tracking-[0.26em] text-white transition-colors hover:bg-[#20BA5A]"
                >
                  Ask Us on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 w-full items-center justify-center border border-ink/20 text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:border-ink"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* ── ERROR STATE ──────────────────────────────────────────── */}
          {modalState === "error" && (
            <div className="flex flex-col items-center gap-5 px-7 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center border border-border-soft bg-cream">
                <AlertCircle className="h-6 w-6 text-sale" />
              </div>
              <div>
                <p className="font-display text-xl font-light italic text-ink">
                  Something went wrong
                </p>
                <p className="mx-auto mt-2 max-w-xs text-[12px] leading-relaxed text-ink-soft">
                  {errorMsg}
                </p>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={reset}
                  className="flex h-12 flex-1 items-center justify-center gap-2 bg-ink text-[11px] uppercase tracking-[0.26em] text-ivory transition-colors hover:bg-gold-dark"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 flex-1 items-center justify-center border border-ink text-[11px] uppercase tracking-[0.26em] text-ink transition-colors hover:bg-ink hover:text-ivory"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>{/* end scrollable body */}
      </div>
    </div>
  );
}
