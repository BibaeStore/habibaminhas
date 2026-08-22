-- Pinterest pins carry a title and a destination link, neither of which fits the
-- Instagram/Facebook shape of a single caption blob.
--
-- These have to be stored rather than derived at publish time: a post can sit in the
-- review queue for days, and the approve path reads the row back with no access to the
-- product's category — which the pin's link needs.
alter table social_post_log
  add column if not exists pin_title text,
  add column if not exists pin_link  text;

comment on column social_post_log.pin_title is
  'Pinterest pin title (<=100 chars). Null for platforms without the concept.';
comment on column social_post_log.pin_link is
  'Pinterest destination URL, UTM-tagged. The reason Pinterest is worth having.';
