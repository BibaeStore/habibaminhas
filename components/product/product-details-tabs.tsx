"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductDetailsTabs({
  description,
  shortDescription,
}: {
  description: string | null;
  shortDescription: string | null;
}) {
  const [activeTab, setActiveTab] = useState<"details" | "description">("details");

  return (
    <div className="mt-10">
      {/* Tab Headers */}
      <div className="flex gap-8 border-b border-border-soft">
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "pb-3 text-[13px] uppercase tracking-[0.26em] transition-colors",
            activeTab === "details"
              ? "border-b-2 border-ink text-ink"
              : "text-ink-soft hover:text-ink"
          )}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("description")}
          className={cn(
            "pb-3 text-[13px] uppercase tracking-[0.26em] transition-colors",
            activeTab === "description"
              ? "border-b-2 border-ink text-ink"
              : "text-ink-soft hover:text-ink"
          )}
        >
          Description
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "details" && (
          <div
            className="prose prose-sm max-w-none text-ink-soft
              prose-headings:font-display prose-headings:font-normal prose-headings:italic prose-headings:text-ink prose-headings:mt-6 prose-headings:mb-3
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base
              prose-p:leading-relaxed prose-p:mb-4
              prose-strong:font-semibold prose-strong:text-ink
              prose-ul:list-disc prose-ul:ml-5 prose-ul:mb-4 prose-ul:space-y-1
              prose-ol:list-decimal prose-ol:ml-5 prose-ol:mb-4 prose-ol:space-y-1
              prose-li:text-ink-soft prose-li:leading-relaxed
              prose-a:text-gold-dark prose-a:underline hover:prose-a:text-gold-dark-dark
              prose-code:bg-cream prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
              prose-pre:bg-cream prose-pre:p-4 prose-pre:rounded prose-pre:overflow-x-auto
              prose-blockquote:border-l-4 prose-blockquote:border-gold-dark prose-blockquote:pl-4 prose-blockquote:italic
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: description || "<p>No details available.</p>" }}
          />
        )}
        {activeTab === "description" && (
          <div
            className="prose prose-sm max-w-none text-ink-soft
              prose-p:leading-relaxed prose-p:mb-4
              prose-strong:font-semibold prose-strong:text-ink
              prose-a:text-gold-dark prose-a:underline hover:prose-a:text-gold-dark-dark
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{
              __html: shortDescription || "<p>No description available.</p>",
            }}
          />
        )}
      </div>
    </div>
  );
}
