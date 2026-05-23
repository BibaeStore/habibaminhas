"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

interface FAQAccordionProps {
  questions: FAQItem[];
}

export function FAQAccordion({ questions }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  return (
    <div className="space-y-4">
      {questions.map((faq, index) => (
        <div
          key={index}
          className="border border-border-soft bg-ivory transition-colors hover:border-gold-dark"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors"
          >
            <h3 className="text-[15px] font-semibold leading-relaxed text-ink">
              {faq.q}
            </h3>
            <ChevronDown
              className={`h-5 w-5 flex-shrink-0 text-gold-dark transition-transform ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="border-t border-border-soft px-5 pb-5 pt-4">
              <p className="text-[14px] leading-relaxed text-ink-soft">
                {faq.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
