"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface FAQ {
  question: string;
  answer: string;
}

/** Splits plain-text content (stored with blank-line separators) into blocks. */
function toBlocks(text: string): string[] {
  return text
    .split(/\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
}

/** Renders the structured spec text ("Stitching: ...", "Fabric: ...") as
 *  labelled rows — the label before the first colon becomes a bold heading. */
function SpecList({ text }: { text: string }) {
  const blocks = toBlocks(text);
  if (blocks.length === 0) return <p className="text-ink-soft text-[14px]">No details available.</p>;

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const sep = block.indexOf(":");
        if (sep === -1) {
          return (
            <p key={i} className="text-ink-soft text-[14px] leading-relaxed">
              {block}
            </p>
          );
        }
        const label = block.slice(0, sep).trim();
        const value = block.slice(sep + 1).trim();
        return (
          <div key={i}>
            <h4 className="font-semibold text-ink text-[14px]">{label}</h4>
            <p className="text-ink-soft text-[14px] leading-relaxed mt-1">{value}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Renders prose content as readable paragraphs. */
function Prose({ text }: { text: string }) {
  const paragraphs = toBlocks(text);
  if (paragraphs.length === 0) return <p className="text-ink-soft text-[14px]">No description available.</p>;

  return (
    <div className="space-y-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-ink-soft text-[14px] leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}

export function ProductDetailsTabs({
  details,
  description,
  faqs,
}: {
  /** Structured spec text (DB: short_description) — shown under "Details". */
  details: string | null;
  /** Long prose copy (DB: description) — shown under "Description". */
  description: string | null;
  faqs?: FAQ[] | null;
}) {
  const [activeTab, setActiveTab] = useState<"details" | "description" | "faqs">("details");

  const tabClass = (tab: typeof activeTab) =>
    cn(
      "pb-3 text-[13px] uppercase tracking-[0.26em] transition-colors",
      activeTab === tab
        ? "border-b-2 border-ink text-ink"
        : "text-ink-soft hover:text-ink"
    );

  return (
    <div className="mt-10">
      {/* Tab Headers */}
      <div className="flex gap-8 border-b border-border-soft">
        <button onClick={() => setActiveTab("details")} className={tabClass("details")}>
          Details
        </button>
        <button onClick={() => setActiveTab("description")} className={tabClass("description")}>
          Description
        </button>
        {faqs && faqs.length > 0 && (
          <button onClick={() => setActiveTab("faqs")} className={tabClass("faqs")}>
            FAQs
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "details" && <SpecList text={details || ""} />}
        {activeTab === "description" && <Prose text={description || ""} />}
        {activeTab === "faqs" && faqs && faqs.length > 0 && (
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-border-soft pb-6 last:border-0 last:pb-0">
                <h3 className="font-medium text-ink mb-2 text-[15px]">{faq.question}</h3>
                <p className="text-ink-soft text-[14px] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
