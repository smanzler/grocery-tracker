drop policy "Enable select based on role" on "public"."pantry_items";

drop policy "Enable select based on role" on "public"."pantry_events";

revoke delete on table "public"."pantry_items" from "anon";

revoke insert on table "public"."pantry_items" from "anon";

revoke references on table "public"."pantry_items" from "anon";

revoke select on table "public"."pantry_items" from "anon";

revoke trigger on table "public"."pantry_items" from "anon";

revoke truncate on table "public"."pantry_items" from "anon";

revoke update on table "public"."pantry_items" from "anon";

revoke delete on table "public"."pantry_items" from "authenticated";

revoke insert on table "public"."pantry_items" from "authenticated";

revoke references on table "public"."pantry_items" from "authenticated";

revoke select on table "public"."pantry_items" from "authenticated";

revoke trigger on table "public"."pantry_items" from "authenticated";

revoke truncate on table "public"."pantry_items" from "authenticated";

revoke update on table "public"."pantry_items" from "authenticated";

revoke delete on table "public"."pantry_items" from "service_role";

revoke insert on table "public"."pantry_items" from "service_role";

revoke references on table "public"."pantry_items" from "service_role";

revoke select on table "public"."pantry_items" from "service_role";

revoke trigger on table "public"."pantry_items" from "service_role";

revoke truncate on table "public"."pantry_items" from "service_role";

revoke update on table "public"."pantry_items" from "service_role";

alter table "public"."pantry_items" drop constraint "pantry_items_grocery_item_id_fkey";

alter table "public"."pantry_items" drop constraint "pantry_items_household_id_fkey";

alter table "public"."pantry_items" drop constraint "pantry_items_household_item_unique";

alter table "public"."pantry_items" drop constraint "pantry_items_pkey";

drop index if exists "public"."pantry_items_household_item_unique";

drop index if exists "public"."pantry_items_pkey";

drop table "public"."pantry_items";

set check_function_bodies = off;

create or replace view "public"."pantry_items" with (security_invoker = on) as  SELECT pb.household_id,
    pb.grocery_item_id,
    gi.name,
    gi.image_url,
    gi.brand,
    gi.quantity,
    gi.quantity_unit,
    gi.is_global,
    sum(pb.remaining_quantity) AS total_quantity,
    min(pb.expires_at) AS next_expiration
   FROM (public.pantry_batches pb
     JOIN public.grocery_items gi ON ((gi.id = pb.grocery_item_id)))
  WHERE (pb.remaining_quantity > 0)
  GROUP BY pb.household_id, pb.grocery_item_id, gi.name, gi.image_url, gi.brand, gi.quantity, gi.quantity_unit, gi.is_global;


CREATE OR REPLACE FUNCTION public.add_pantry_batches(p_household_id uuid, p_items jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_batch_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  for v_item in
    select * from jsonb_array_elements(p_items)
  loop
    insert into pantry_batches (
      household_id,
      user_id,
      grocery_item_id,
      initial_quantity,
      remaining_quantity,
      expires_at
    )
    values (
      p_household_id,
      v_user_id,
      (v_item->>'grocery_item_id')::uuid,
      (v_item->>'quantity')::integer,
      (v_item->>'quantity')::integer,
      (v_item->>'expires_at')::date
    )
    returning id into v_batch_id;

    insert into pantry_events (batch_id, user_id, event, quantity)
    values (v_batch_id, v_user_id, 'add', (v_item->>'quantity')::integer);
  end loop;
end;$function$
;

CREATE OR REPLACE FUNCTION public.consume_pantry_item(p_household_id uuid, p_grocery_item_id uuid, p_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$declare
  v_remaining integer := p_quantity;
  v_batch record;
  v_user_id uuid := auth.uid();
  v_total integer;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  select coalesce(sum(remaining_quantity), 0)
  into v_total
  from pantry_batches
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id
    and remaining_quantity > 0;

  if v_total < p_quantity then
    raise exception 'Not enough inventory to consume';
  end if;

  for v_batch in
    select *
    from pantry_batches
    where household_id = p_household_id
      and grocery_item_id = p_grocery_item_id
      and remaining_quantity > 0
    order by
      expires_at asc nulls last,
      created_at asc
    for update
  loop
    exit when v_remaining = 0;

    -- if current batch does not have enough or is just enough, use all
    if v_batch.remaining_quantity <= v_remaining then
      update pantry_batches
      set remaining_quantity = 0
      where id = v_batch.id;

      insert into pantry_events
        (user_id, batch_id, event, quantity)
      values
        (v_user_id, v_batch.id, 'consume', v_batch.remaining_quantity);

      -- update remaining and continue
      v_remaining := v_remaining - v_batch.remaining_quantity;
    else
      -- if current batch is enough, update batch
      update pantry_batches
      set remaining_quantity = remaining_quantity - v_remaining
      where id = v_batch.id;

      insert into pantry_events
        (user_id, batch_id, event, quantity)
      values
        (v_user_id, v_batch.id, 'consume', v_remaining);

      v_remaining := 0;
    end if;
  end loop;
end;$function$
;

CREATE OR REPLACE FUNCTION public.merge_grocery_items(p_source_id uuid, p_target_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$declare
  v_user_id uuid := auth.uid();
  v_source_item record;
  v_target_item record;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_source_item
  from grocery_items
  where id = p_source_id;

  select * into v_target_item
  from grocery_items
  where id = p_target_id;

  if v_source_item is null then
    raise exception 'Source grocery item not found';
  end if;

  if v_target_item is null then
    raise exception 'Target grocery item not found';
  end if;

  if v_source_item.user_id != v_user_id then
    if v_source_item.household_id is not null then
      if not is_household_user(v_source_item.household_id) then
        raise exception 'Unauthorized to merge source item';
      end if;
    else
      raise exception 'Unauthorized to merge source item';
    end if;
  end if;

  if v_source_item.is_global = true then
    raise exception 'Cannot merge global items';
  end if;

  -- updates
  
  update list_items
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  update pantry_batches
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  delete from grocery_items
  where id = p_source_id;

  return true;
end;$function$
;


  create policy "Enable select based on role"
  on "public"."pantry_events"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.pantry_batches pb
     JOIN public.household_users hu ON ((hu.household_id = pb.household_id)))
  WHERE ((pb.id = pantry_events.batch_id) AND (hu.user_id = ( SELECT auth.uid() AS uid))))));

