/** Shared shapes for the occasion agent. Kept separate so `calendar.ts` stays dependency-free. */

export type OccasionCategory = "islamic" | "national" | "international" | "seasonal";
export type Recurrence = "weekly" | "fixed" | "lunar" | "nth_weekday";

export type OccasionRow = {
  id: string;
  slug: string;
  name: string;
  category: OccasionCategory;
  recurrence: Recurrence;
  weekday: number | null;
  month: number | null;
  day: number | null;
  nth: number | null;
  greeting: string;
  /**
   * The Arabic calligraphy headline, where a widely-used phrase exists.
   *
   * Stored rather than derived: "Jumma Mubarak" does not tell you whether the Arabic agrees as
   * masculine or feminine, and deriving it produced جمعة مباركة where the correct form is
   * جمعة مبارك. Null for national, international and seasonal days — inventing an Arabic
   * greeting for Mother's Day would be worse than leaving the line out.
   */
  greeting_ar: string | null;
  subtitle: string | null;
  theme: string | null;
  hashtags: string[];
  enabled: boolean;
  priority: number;
  /** Lunar occasions only: { "2026": "2026-03-20" }, filled by the web-search resolver. */
  resolved_dates: Record<string, string>;
};

export type OccasionPostStatus =
  | "planned" | "generating" | "ready" | "cancelled"
  | "publishing" | "published" | "failed" | "skipped";

export type OccasionPostRow = {
  id: string;
  occasion_id: string | null;
  occasion_slug: string;
  occasion_name: string;
  occasion_date: string;
  scheduled_for: string;
  status: OccasionPostStatus;
  product_id: string | null;
  image_url: string | null;
  image_prompt: string | null;
  caption_instagram: string | null;
  caption_facebook: string | null;
  hashtags: string[];
  regenerate_count: number;
  approved_at: string | null;
  published_at: string | null;
  platform_results: unknown;
  error: string | null;
  created_at: string;
  updated_at: string;
};
