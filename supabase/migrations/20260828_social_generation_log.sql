-- Memory for AI-written captions.
--
-- Two jobs, and the second is the one that matters:
--
--   1. An audit trail -- what the model wrote, which model, what it cost.
--   2. The anti-repetition memory. The generator is *told* the recent hooks and angles so it
--      can avoid them, and the result is *checked* against caption_hash before publishing. A
--      model that ignores the instruction still cannot ship a duplicate. Prompting alone
--      drifts: asked forty times not to repeat itself, a model eventually repeats itself.
--
-- Separate from social_post_log on purpose. That table is the record of what was *published*;
-- this is the record of what was *generated*, including attempts that were rejected and never
-- reached Meta. Merging them would make "how many posts went out" ambiguous.

create table if not exists public.social_generation_log (
  id           uuid primary key default gen_random_uuid(),

  -- Which stream asked for this. Reels and statics arrive in later phases; the column exists
  -- now so the recent-hooks query never has to change shape.
  stream       text not null check (stream in ('carousel', 'static', 'reel')),

  product_id   uuid references public.products(id) on delete set null,
  product_slug text,

  -- The parts fed back into the next prompt.
  hook         text,
  angle        text,          -- 3-word label of the angle taken, e.g. "fabric in light"

  -- Reel-only, unused until the video phase. Declared now for the same reason as `stream`.
  camera_signature text,
  audio_mood       text,

  -- Exact-duplicate guard. sha256 of the normalised caption.
  caption_hash text,

  model        text,
  input_tokens  int,
  output_tokens int,
  cost_cents   numeric(10,4),

  -- Failures are logged too. A run that fell back to the deterministic builder is a fact
  -- worth being able to count -- silent fallback is how "the AI captions stopped working"
  -- goes unnoticed for a fortnight.
  ok           boolean not null default true,
  error        text,

  created_at   timestamptz not null default now()
);

-- The recent-hooks lookup: last N for one stream, newest first.
create index if not exists social_generation_log_stream_recent
  on public.social_generation_log (stream, created_at desc);

-- The duplicate check.
create index if not exists social_generation_log_hash
  on public.social_generation_log (stream, caption_hash)
  where caption_hash is not null;

-- ---------------------------------------------------------------------------
-- Two switches on social_settings.
-- ---------------------------------------------------------------------------
alter table public.social_settings
  -- Kill switch. Off => the proven deterministic caption builder, exactly as today.
  add column if not exists ai_captions_enabled boolean not null default false,
  -- Live captions currently print "Rs. 5,500". The owner asked for price to be left out
  -- (2026-08-28). A column rather than a constant because it is a marketing preference, not
  -- an engineering fact, and reversing it should not need a deploy.
  add column if not exists caption_include_price boolean not null default false;

-- Added the same day, after the first live test: six consecutive generations all answered a
-- care question ("wash cold, dry in shade, iron on medium"), because care is the safest answer
-- in every product's FAQ list. The hook and angle memory could not see it -- they track how a
-- caption opens, not what it answers. Storing the topic and feeding it back fixed the rut.
alter table public.social_generation_log
  add column if not exists faq_topic text;
