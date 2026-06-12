"use client";

import { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { AdminCard } from "@/components/admin/ui/card";

type State = "idle" | "loading" | "ok" | "not_configured" | "not_enough_data" | "error";

interface ApiResult {
  code?:            string;
  message?:         string;
  recommendations?: string;
  current?:         number;
  needed?:          number;
  error?:           string;
}

function ProgressBar({ current, needed }: { current: number; needed: number }) {
  const pct = Math.min(100, Math.round((current / needed) * 100));
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-[11px] text-[var(--admin-text-muted)]">
        <span>{current} orders</span>
        <span>need {needed}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--admin-surface-alt)]">
        <div className="h-full rounded-full bg-[var(--admin-primary)] transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function renderRecommendations(text: string) {
  const lines = text.split("\n").filter(Boolean);
  return (
    <ul className="space-y-2.5">
      {lines.map((line, i) => {
        const clean = line.replace(/^[\s\-\*\•\d\.]+/, "").trim();
        if (!clean) return null;
        return (
          <li key={i} className="flex gap-2 text-[13px] text-[var(--admin-text)]">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--admin-primary)]" />
            {clean}
          </li>
        );
      })}
    </ul>
  );
}

export function AIInsightsPanel() {
  const [state, setState]     = useState<State>("idle");
  const [result, setResult]   = useState<ApiResult | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  async function getInsights() {
    setState("loading");
    setResult(null);
    try {
      const res  = await fetch("/api/admin/analytics/ai-insights/", { method: "POST" });
      const json = await res.json().catch(() => ({})) as ApiResult;

      if (json.code === "not_configured") { setState("not_configured"); setResult(json); return; }
      if (json.code === "not_enough_data") { setState("not_enough_data"); setResult(json); return; }
      if (json.code === "ok" && json.recommendations) { setState("ok"); setResult(json); setLastRun(new Date()); return; }
      setState("error");
      setResult(json);
    } catch {
      setState("error");
      setResult({ error: "Network error. Please try again." });
    }
  }

  return (
    <AdminCard>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h2 className="text-[17px] font-semibold text-[var(--admin-text)]">AI Insights</h2>
        </div>
        <span className="rounded-full border border-[var(--admin-border)] px-3 py-1 text-[11px] font-medium text-[var(--admin-text-muted)]">
          Powered by Claude
        </span>
      </div>

      {/* Idle */}
      {state === "idle" && (
        <div className="rounded-lg bg-[var(--admin-surface-alt)] px-5 py-6 text-center">
          <p className="mb-1 text-[14px] font-medium text-[var(--admin-text)]">
            Get strategy recommendations
          </p>
          <p className="text-[13px] text-[var(--admin-text-muted)]">
            Claude will analyse your real sales data and suggest what to stock, how to price, and how to reduce cancellations.
          </p>
          <button
            onClick={getInsights}
            className="mt-4 inline-flex items-center gap-2 rounded-[var(--admin-radius)] bg-[var(--admin-primary)] px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Get AI Recommendations
          </button>
        </div>
      )}

      {/* Loading */}
      {state === "loading" && (
        <div className="flex flex-col items-center gap-3 py-8 text-[13px] text-[var(--admin-text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--admin-primary)]" />
          Analysing your sales data…
        </div>
      )}

      {/* Not configured */}
      {state === "not_configured" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">API key not configured</p>
              <p className="mt-1 text-[12px] text-amber-700">
                Add <code className="rounded bg-amber-100 px-1 font-mono">ANTHROPIC_API_KEY</code> to your{" "}
                <code className="rounded bg-amber-100 px-1 font-mono">.env.local</code> to enable AI insights.
              </p>
              <button
                onClick={() => setState("idle")}
                className="mt-3 text-[12px] text-amber-600 hover:underline"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not enough data */}
      {state === "not_enough_data" && result && (
        <div className="rounded-lg bg-[var(--admin-surface-alt)] px-5 py-5">
          <p className="text-[13px] font-medium text-[var(--admin-text)]">Not enough data yet</p>
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">{result.message}</p>
          {result.current !== undefined && result.needed !== undefined && (
            <ProgressBar current={result.current} needed={result.needed} />
          )}
          <button
            onClick={() => setState("idle")}
            className="mt-4 text-[12px] text-[var(--admin-primary)] hover:underline"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Success */}
      {state === "ok" && result?.recommendations && (
        <div>
          {renderRecommendations(result.recommendations)}
          <div className="mt-5 flex items-center justify-between border-t border-[var(--admin-border)] pt-4">
            <span className="text-[11px] text-[var(--admin-text-muted)]">
              {lastRun ? `Generated ${lastRun.toLocaleString("en-PK", { timeStyle: "short", dateStyle: "short" })}` : ""}
            </span>
            <button
              onClick={getInsights}
              className="text-[12px] text-[var(--admin-primary)] hover:underline"
            >
              Refresh recommendations
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {state === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-[13px] text-red-700">{result?.error ?? "Something went wrong."}</p>
          <button
            onClick={() => setState("idle")}
            className="mt-3 text-[12px] text-red-600 hover:underline"
          >
            ← Try again
          </button>
        </div>
      )}
    </AdminCard>
  );
}
