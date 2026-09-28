-- Colour variants on a single product (first used by product 049, 2026-09-28).
--
-- products.colors — null on every product that has one colourway (all products before 049).
--   A non-null value is an array of
--     {"name":"Pink","code":"PNK","hex":"#d9577f","images":["…webp"],"sizes_stock":{"M":1}}
--   and switches the product page into colour mode: swatches, per-colour gallery, per-colour
--   stock. products.stock stays the product-wide total and must equal the sum across colours.
--
-- order_items.color — the colourway the customer chose; null for single-colour products.
--   The colour is ALSO folded into product_title and sku on the order line, so every existing
--   order screen, email, invoice and PostEx booking shows it without being changed.

alter table public.products    add column if not exists colors jsonb;
alter table public.order_items add column if not exists color  text;

-- decrement_product_stock: unchanged for single-colour products. When an item carries a
-- colour and a size, that colour's sizes_stock entry is decremented too, so a sold-out
-- colourway greys out on the page while the other colours stay buyable.
create or replace function public.decrement_product_stock(p_items jsonb, p_threshold integer default 5)
 returns table(id uuid, title text, stock integer, crossed_threshold boolean)
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  item jsonb;
  v_id uuid;
  v_qty integer;
  v_old integer;
  v_new integer;
  v_title text;
  v_colors jsonb;
  v_color text;
  v_size text;
  v_idx integer;
  v_left integer;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    return;
  end if;

  for item in select * from jsonb_array_elements(p_items) loop
    v_id    := (item ->> 'product_id')::uuid;
    v_qty   := coalesce((item ->> 'quantity')::int, 0);
    v_color := item ->> 'color';
    v_size  := item ->> 'size';

    if v_id is null or v_qty <= 0 then
      continue;
    end if;

    select p.stock, p.title, p.colors into v_old, v_title, v_colors
    from public.products p
    where p.id = v_id
    for update;

    if not found then
      continue;
    end if;

    v_new := greatest(0, v_old - v_qty);

    if v_color is not null and v_size is not null and jsonb_typeof(v_colors) = 'array' then
      v_idx := null;
      select (e.ord - 1)::int into v_idx
      from jsonb_array_elements(v_colors) with ordinality as e(el, ord)
      where e.el ->> 'name' = v_color
      limit 1;

      if v_idx is not null then
        v_left := greatest(0, coalesce((v_colors -> v_idx -> 'sizes_stock' ->> v_size)::int, 0) - v_qty);
        v_colors := jsonb_set(v_colors, array[v_idx::text, 'sizes_stock', v_size], to_jsonb(v_left), true);
      end if;
    end if;

    update public.products p
    set stock = v_new, colors = v_colors, updated_at = now()
    where p.id = v_id;

    id := v_id;
    title := v_title;
    stock := v_new;
    crossed_threshold := (v_old > p_threshold and v_new <= p_threshold);
    return next;
  end loop;
end;
$function$;
