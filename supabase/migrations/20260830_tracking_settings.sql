-- Marketing / tracking configuration gets its own column, isolated from seo_settings.
--
-- WHY A SEPARATE COLUMN
-- ---------------------
-- The admin Settings page saves `seo_settings` by replacing the whole JSON block. Its form
-- keys had drifted from the ones the storefront reads (`fbPixel` vs `fb_pixel`), so a single
-- click on Save dropped `fb_pixel` and the Meta Pixel silently vanished from every page -- no
-- deploy, no error. That read/write bug is fixed, but the shape of the hazard remains: one
-- textarea's Save owning a block that another screen also writes. Giving marketing settings
-- their own column makes an SEO save and a marketing save structurally incapable of
-- overwriting each other, rather than merely careful not to.
--
-- SHAPE
--   { "meta_pixels": [ { id, label, pixel_id, enabled } ], "test_event_code": "" }

alter table public.settings
  add column if not exists tracking_settings jsonb not null default '{}'::jsonb;

-- Seed from the pixel already live in seo_settings, so behaviour is unchanged on day one:
-- the same single pixel, now also described in the new shape.
update public.settings
set tracking_settings = jsonb_build_object(
      'meta_pixels', jsonb_build_array(
        jsonb_build_object(
          'id',       'primary',
          'label',    'Main store pixel',
          'pixel_id', seo_settings->>'fb_pixel',
          'enabled',  true
        )
      ),
      'test_event_code', ''
    )
where id = 1
  and coalesce(seo_settings->>'fb_pixel', '') <> ''
  and coalesce(tracking_settings, '{}'::jsonb) = '{}'::jsonb;
