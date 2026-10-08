-- order_items.product_id was `uuid`, but "Products".id is a numeric
-- bigint. Fixes the type and adds the foreign key.

alter table public.order_items
  alter column product_id type bigint using null;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id)
  references public."Products"(id);
