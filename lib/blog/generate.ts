import { WRITER_MODEL, type BlogAutomationConfig } from "./config";
import type { Topic } from "./topics";

/**
 * Blog writing via the Claude API.
 *
 * Two calls, deliberately:
 *   1. Research — Claude's server-side web_search tool gathers what is actually
 *      current for this topic. Without it the model writes from training data and
 *      "2026 trends" posts read as generic.
 *   2. Write — a separate call with structured outputs, so the response is guaranteed
 *      to match the journal_posts content shape rather than needing JSON repair.
 *
 * Splitting them keeps the tool loop out of the structured-output call, which is the
 * more fragile combination, and makes each step independently debuggable.
 */

const API = "https://api.anthropic.com/v1/messages";
const VERSION = "2023-06-01";

export interface GeneratedPost {
  title: string;
  slug: string;
  meta_description: string;
  keywords: string;
  excerpt: string;
  category_tag: string;
  content: unknown[];
  imagePrompt: string;
  /** Token usage across both calls, for cost logging. */
  usage: { inputTokens: number; outputTokens: number };
}

/** JSON Schema the writer must satisfy. Mirrors the live journal_posts content shape. */
const POST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "meta_description",
    "keywords",
    "excerpt",
    "category_tag",
    "content",
    "imagePrompt",
  ],
  properties: {
    title: { type: "string", description: "50-60 characters. Must not exceed 60." },
    meta_description: {
      type: "string",
      description: "140-160 characters. Must not exceed 160.",
    },
    keywords: { type: "string", description: "6-8 comma-separated keywords." },
    excerpt: { type: "string", description: "2 sentences, under 220 characters." },
    category_tag: {
      type: "string",
      enum: ["Style Notes", "Fabric", "Kids", "Baby", "Occasions", "Virtual Try-On"],
    },
    imagePrompt: {
      type: "string",
      description:
        "A photography brief for the hero image. Describe garments, fabric, styling, light and mood. No people's faces, no text or lettering in the image.",
    },
    content: {
      type: "array",
      description: "Ordered blocks: exactly one intro, 6-10 sections, exactly one faq (last).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["type"],
        properties: {
          type: { type: "string", enum: ["intro", "section", "faq"] },
          heading: { type: "string" },
          content: { type: "string" },
          subsections: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["title", "content"],
              properties: { title: { type: "string" }, content: { type: "string" } },
            },
          },
          questions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["question", "answer"],
              properties: { question: { type: "string" }, answer: { type: "string" } },
            },
          },
        },
      },
    },
  },
} as const;

async function callClaude(
  cfg: BlogAutomationConfig,
  body: Record<string, unknown>,
): Promise<any> {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "x-api-key": cfg.anthropicKey,
      "anthropic-version": VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`Claude ${res.status}: ${json.error?.message ?? "unknown error"}`);
  }
  // Safety classifiers can decline with HTTP 200 — check before reading content.
  if (json.stop_reason === "refusal") {
    throw new Error(`Claude refused: ${json.stop_details?.category ?? "unknown"}`);
  }
  return json;
}

function textOf(json: any): string {
  return (json.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n");
}

/** Step 1 — current, sourced context for the topic. */
async function research(cfg: BlogAutomationConfig, topic: Topic): Promise<{ notes: string; usage: any }> {
  const json = await callClaude(cfg, {
    model: WRITER_MODEL,
    max_tokens: 4000,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 4 }],
    messages: [
      {
        role: "user",
        content: `You are researching for a Pakistani women's fashion blog (brand: Habiba Minhas — handcrafted ladies suits, kids formal wear, baby products, accessories; based in Karachi).

Topic: "${topic.title}"
Target keywords: ${topic.keywords.join(", ")}

Search the web and report, concisely:
1. What is genuinely current for this topic in Pakistan right now (${new Date().getFullYear()}) — colours, silhouettes, fabrics, occasions.
2. Specific, concrete facts a reader would find useful (prices in PKR where relevant, fabric properties, care rules, sizing conventions).
3. Questions real people ask about this topic.
4. Anything commonly claimed about this topic that is actually wrong.

Return plain notes. Do not write the article.`,
      },
    ],
  });

  return { notes: textOf(json), usage: json.usage };
}

/** Step 2 — write the post as structured JSON. */
export async function generatePost(
  cfg: BlogAutomationConfig,
  topic: Topic,
  links: {
    collections: { url: string; label: string }[];
    posts: { url: string; title: string }[];
    products: { url: string; title: string }[];
  },
): Promise<GeneratedPost> {
  const { notes, usage: researchUsage } = await research(cfg, topic);

  const linkMenu = [
    "COLLECTIONS:",
    ...links.collections.map((c) => `  ${c.url} — ${c.label}`),
    "",
    "PRODUCTS (in stock — link these when recommending something to buy):",
    ...links.products.slice(0, 20).map((p) => `  ${p.url} — ${p.title}`),
    "",
    "EXISTING ARTICLES (link when genuinely relevant):",
    ...links.posts.slice(0, 25).map((p) => `  ${p.url} — ${p.title}`),
  ].join("\n");

  const json = await callClaude(cfg, {
    model: WRITER_MODEL,
    max_tokens: 16000,
    output_config: { effort: "high", format: { type: "json_schema", schema: POST_SCHEMA } },
    system: `You write for Habiba Minhas, a Pakistani fashion house in Karachi selling handcrafted ladies suits, kids formal wear, baby nursery products, and accessories.

VOICE
Warm, expert, specific. Write like a knowledgeable friend who works in the industry — not like a brochure and not like an SEO article. Short paragraphs. Concrete detail over adjectives. Pakistani context throughout (occasions, climate, cities, PKR prices).

NEVER
- No "In today's world", "delve", "elevate your wardrobe", "must-have", "game-changer".
- No invented statistics, no fake studies, no made-up customer quotes.
- No claims about Habiba Minhas products you cannot verify from the link list.

HARD REQUIREMENTS (the post is rejected automatically if any fail)
- Body text totals 1,400-2,000 words.
- title: 50-60 characters. Never exceed 60.
- meta_description: 140-160 characters. Never exceed 160.
- At least 4 markdown links to URLs from the supplied list, placed naturally in section text. Format: [anchor text](/url). Use ONLY URLs from that list — never invent one.
- 6-10 section blocks, each with a heading and substantial content.
- Exactly one faq block, last, with 4-6 question/answer pairs. Answers 2-4 sentences.
- Headings are specific and useful, not generic ("Choosing Fabric for Karachi Summers", not "Fabric").`,
    messages: [
      {
        role: "user",
        content: `Write the article.

TITLE (you may refine, but keep the same search intent and stay ≤60 chars):
${topic.title}

TARGET KEYWORDS: ${topic.keywords.join(", ")}
ENTITIES TO COVER NATURALLY: ${topic.entities.join(", ")}
INTENT: ${topic.searchIntent ?? "Informational"}
CTA THEME: ${topic.cta ?? "Shop the collection"}

CURRENT RESEARCH (from live web search — use the concrete facts, ignore anything irrelevant):
${notes}

AVAILABLE INTERNAL LINKS — use at least 4, exactly as written:
${linkMenu}`,
      },
    ],
  });

  const raw = textOf(json);
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Writer returned unparseable JSON (${raw.slice(0, 200)})`);
  }

  return {
    ...parsed,
    slug: topic.slug,
    usage: {
      inputTokens: (researchUsage?.input_tokens ?? 0) + (json.usage?.input_tokens ?? 0),
      outputTokens: (researchUsage?.output_tokens ?? 0) + (json.usage?.output_tokens ?? 0),
    },
  };
}
