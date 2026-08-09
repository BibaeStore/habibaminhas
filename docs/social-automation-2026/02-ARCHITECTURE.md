# Architecture

How the pipeline works, what it stores, and why it is built to accept new platforms without
a rewrite.

---

## The flow, end to end

```
Supabase pg_cron  ──(every 15 min)──▶  /api/cron/social-post
                                              │
                                              ▼
                                    is a slot due right now?
                                    (social_schedule × timezone)
                                              │ yes
                                              ▼
                                    pick the next product
                                    (rotation rules below)
                                              │
                                              ▼
                                    build JPEG derivatives
                                    (WebP is rejected by Instagram)
                                              │
                                              ▼
                                    generate caption + hashtags
                                    per platform
                                              │
                                              ▼
                            ┌─────────────────┴─────────────────┐
                            ▼                                   ▼
                    Instagram adapter                   Facebook adapter
                    (2-step container)                  (/{page}/photos)
                            │                                   │
                            └─────────────────┬─────────────────┘
                                              ▼
                                    write social_post_log
                                    (success or failure, with error)
```

Scheduling is Supabase `pg_cron` + `pg_net` calling an authenticated Next.js route, matching
`/api/cron/blog-generate` and `/api/cron/postex-sync`. **Vercel cron is not used** — the
project is on the free plan and the pg_cron route is already proven in production here.

The cron fires every 15 minutes and decides for itself whether a slot is due. That is more
robust than encoding the cadence in the cron expression: changing from 1/day to 2/day
becomes a database edit rather than a migration and redeploy.

---

## Database schema

Four new tables. All prefixed `social_` so they are trivially separable from the rest of the
schema, and none of them touch existing tables.

### `social_accounts` — one row per connected platform account

```sql
CREATE TABLE public.social_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform        text NOT NULL,          -- 'instagram' | 'facebook' | 'tiktok' | …
  account_label   text NOT NULL,          -- '@habibaminhas.pk' — for the admin UI
  external_id     text NOT NULL,          -- IG Business Account ID / FB Page ID
  enabled         boolean NOT NULL DEFAULT true,
  credentials     jsonb NOT NULL DEFAULT '{}'::jsonb,
  meta            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (platform, external_id)
);
```

> **Credentials note.** Tokens belong in environment variables, not in a database row. The
> `credentials` column holds only non-secret references (which env var to read, token
> expiry hints). Adding a platform must never mean pasting a secret into a table that RLS
> could later be loosened on.

### `social_settings` — the owner's dials

```sql
CREATE TABLE public.social_settings (
  id                   int PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- single row
  enabled              boolean NOT NULL DEFAULT false,            -- global kill switch
  posts_per_period     int     NOT NULL DEFAULT 1,
  period               text    NOT NULL DEFAULT 'day',            -- 'day' | 'week'
  products_per_post    int     NOT NULL DEFAULT 1 CHECK (products_per_post BETWEEN 1 AND 3),
  timezone             text    NOT NULL DEFAULT 'Asia/Karachi',
  slot_times           text[]  NOT NULL DEFAULT '{19:00}',        -- local times
  categories           text[]  NOT NULL DEFAULT '{ladies-suits}',
  require_in_stock     boolean NOT NULL DEFAULT true,
  min_images           int     NOT NULL DEFAULT 1,
  approval_required    boolean NOT NULL DEFAULT true,             -- review queue on/off
  updated_at           timestamptz NOT NULL DEFAULT now()
);
```

Everything the owner asked to be adjustable lives here: how often, how many products per
post, which categories, which times of day. Changing cadence is one `UPDATE`, no deploy.

### `social_post_log` — the tracker

This is the heart of the no-repeat rule.

```sql
CREATE TABLE public.social_post_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid REFERENCES public.products(id) ON DELETE SET NULL,
  platform       text NOT NULL,
  status         text NOT NULL,          -- 'pending' | 'posted' | 'failed' | 'skipped'
  external_post_id text,                 -- the platform's own post id, for later analytics
  caption        text,
  hashtags       text[],
  image_urls     text[],
  permalink      text,
  error          text,
  rotation_cycle int NOT NULL DEFAULT 1, -- increments each time the catalogue is exhausted
  posted_at      timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX social_post_log_product_platform
  ON public.social_post_log (product_id, platform, status);
CREATE INDEX social_post_log_posted_at ON public.social_post_log (posted_at DESC);
```

`product_id` is `ON DELETE SET NULL` rather than `CASCADE` deliberately — deleting a product
should not erase the record that it was once posted.

### `social_media_queue` — Phase 2, for Reels and uploaded video

```sql
CREATE TABLE public.social_media_queue (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind           text NOT NULL DEFAULT 'reel',   -- 'reel' | 'story' | 'static'
  title          text,
  video_url      text,                            -- Supabase Storage, publicly readable
  thumbnail_url  text,
  caption        text,
  hashtags       text[],
  product_id     uuid REFERENCES public.products(id) ON DELETE SET NULL,
  platforms      text[] NOT NULL DEFAULT '{instagram,facebook}',
  status         text NOT NULL DEFAULT 'queued',  -- 'queued'|'posted'|'failed'|'paused'
  scheduled_for  timestamptz,
  posted_at      timestamptz,
  error          text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
```

Uploaded through an admin form, stored in a new `social-media` Storage bucket, drained on
its own cadence independent of the product rotation.

---

## The rotation rule

The requirement, restated precisely:

> Never repeat a product until every eligible product has been posted. When new products
> appear, post those **before** starting to repeat.

That is a single ordered query, not a state machine:

```sql
SELECT p.id, p.slug, p.title, p.category, p.images, p.price, p.sizes_stock
FROM public.products p
LEFT JOIN LATERAL (
  SELECT max(l.posted_at) AS last_posted, max(l.rotation_cycle) AS last_cycle
  FROM public.social_post_log l
  WHERE l.product_id = p.id AND l.status = 'posted'
) l ON true
WHERE p.status = 'active'
  AND p.category = ANY (<settings.categories>)
  AND (<settings.require_in_stock> = false OR p.stock > 0)
  AND coalesce(array_length(p.images, 1), 0) >= <settings.min_images>
ORDER BY
  l.last_posted NULLS FIRST,   -- 1. never-posted products first
  p.created_at DESC            -- 2. among those, newest first
LIMIT <settings.products_per_post>;
```

Two lines do all the work:

- **`NULLS FIRST`** — anything never posted outranks everything already posted. A product
  added today jumps the queue ahead of repeats automatically. No special "is there new
  stock?" branch is needed; it falls out of the ordering.
- **`last_posted` ascending** — once everything has been posted at least once, the
  least-recently-posted comes next. The catalogue cycles evenly rather than favouring
  whatever happens to sort first.

`rotation_cycle` increments when a pass completes. It is not used for selection — it exists
so the admin UI can say *"cycle 2, 7 of 20 posted"* and so repeats are visible in reporting
rather than looking like a bug.

**Eligibility is evaluated fresh on every run.** A product that sells out between scheduling
and posting is skipped, because `stock > 0` is checked at selection time, not cached.

---

## Platform adapters

Every platform gets one file implementing one interface. Adding TikTok later means writing
one file and inserting one `social_accounts` row — nothing else changes.

```ts
// lib/social/adapters/types.ts
export interface PlatformAdapter {
  readonly platform: string;

  /** Hard limits, used to trim captions and hashtags before sending. */
  readonly limits: {
    captionMaxChars: number;
    hashtagMax: number;
    imagesMax: number;
    imageFormats: readonly string[];   // Instagram: ['jpeg'] only
    supportsCarousel: boolean;
    supportsVideo: boolean;
    supportsLinkInCaption: boolean;    // Instagram: false — see below
  };

  publishImagePost(input: {
    imageUrls: string[];
    caption: string;
    productUrl: string;
  }): Promise<{ externalPostId: string; permalink?: string }>;

  publishVideo?(input: {
    videoUrl: string;
    caption: string;
    thumbnailUrl?: string;
  }): Promise<{ externalPostId: string; permalink?: string }>;
}
```

### Instagram adapter

Publishing is two calls, and the rate limit applies to the second one only:

```
POST /v21.0/{ig-user-id}/media          → returns a container id
POST /v21.0/{ig-user-id}/media_publish  → publishes it   ← 100/24h limit applies here
GET  /v21.0/{container-id}?fields=status_code   → poll for video processing
```

For carousels: create one container per image with `is_carousel_item=true`, then a parent
container with `media_type=CAROUSEL` and the children ids, then publish the parent.

Constraints that shape the content, all from Meta's own docs:

| Constraint | Consequence |
|---|---|
| **JPEG only** | WebP product images must be converted — see below |
| Max 10 carousel items | Products with more images get the first 10 |
| All slides cropped to the first slide's aspect ratio | Keep a consistent aspect ratio, else later slides crop badly |
| 100 published posts / 24h rolling | Far above any realistic cadence here |
| **No clickable links in captions** | The link strategy has to work around this — see [03](./03-CONTENT-AND-SCHEDULE.md) |
| Shopping tags not supported via API | Product tagging stays manual if wanted |

### Facebook adapter

Simpler. A single call to `/{page-id}/photos` with a public image `url`, `caption`, and
`published=true`. Facebook **does** render clickable links in post text, so the product URL
goes directly in the copy there.

Multi-photo posts are not documented on the Pages posts endpoint — the working approach is
to upload each photo unpublished (`published=false`), collect the media ids, then create a
feed post referencing them via `attached_media`. This will be verified against a real Page
during implementation rather than assumed.

---

## The WebP problem, and how it is solved

Instagram rejects WebP. Every product image in Storage is WebP.

**Approach:** generate JPEG derivatives once, at post time, and cache them in a separate
`social/` prefix in the existing public `products` bucket.

```
products/cream-pink-floral-cotton-3-piece-1.webp     ← website (small, fast, WebP)
products/social/cream-pink-floral-cotton-3-piece-1.jpg  ← Instagram (JPEG)
```

- `sharp` is already a dependency; `scripts/optimize-product-images.mjs` already does this
  class of work
- Generated lazily and cached, so each image converts once, not once per post
- Instagram crops all carousel slides to the first slide's ratio, so derivatives are
  produced at a **consistent 4:5 portrait** (1080×1350) — the ratio that occupies the most
  screen in the feed
- The website keeps serving WebP and is completely untouched. **No Core Web Vitals impact,
  no SEO surface touched.**

---

## Failure posture

Copied from the blog pipeline, which has run reliably on the same scheduler:

- **Authenticated cron** — constant-time comparison of `CRON_SECRET`, fails closed when the
  secret is unset
- **All-or-nothing per post** — a post that fails validation is never partially published
- **Every attempt logged**, including failures, with the platform's error message in
  `social_post_log.error`
- **A failed platform does not block the others** — if Instagram errors, Facebook still posts
- **Global kill switch** — `social_settings.enabled = false` stops everything with one
  `UPDATE`, no deploy
- **Daily ceiling** — a hard cap on posts created per day, so a scheduler misfire cannot
  empty the catalogue in an afternoon

---

## Admin UI

A new `/admin/social` section, three tabs, mirroring how the owner described it:

| Tab | Contents |
|---|---|
| **Schedule** | Cadence, products per post, slot times, categories, kill switch |
| **Static posts** | Rotation status ("cycle 1 · 7 of 20 posted"), history, retry failures, manual "post now" |
| **Reels / video** | Upload form, queue, per-item schedule, status |

If `approval_required` is on, generated captions land in a review queue with an Approve /
Edit / Skip action rather than publishing unattended. Recommended for the first fortnight.

---

## Files this would add

```
lib/social/
  adapters/types.ts          interface + shared limits
  adapters/instagram.ts      two-step container publishing
  adapters/facebook.ts       page photo/feed publishing
  select.ts                  the rotation query
  caption.ts                 per-platform caption + hashtag generation
  images.ts                  WebP → JPEG derivative generation and caching
  config.ts                  reads social_settings
app/api/cron/social-post/route.ts
app/admin/social/…           three-tab admin UI
```

Nothing in `app/(storefront)`, nothing in `components/seo`, no changes to existing tables.
**The website is not touched.**
