drop trigger if exists "on_pantry_delete" on "public"."pantry_items";

drop trigger if exists "on_pantry_insert" on "public"."pantry_items";

drop policy "Enable delete based on role" on "public"."pantry_items";

drop policy "Enable insert based on role" on "public"."pantry_items";

drop policy "Enable select based on role" on "public"."pantry_events";

alter table "public"."pantry_events" drop constraint "pantry_events_grocery_item_id_fkey";

alter table "public"."pantry_events" drop constraint "pantry_events_household_id_fkey";

alter table "public"."pantry_items" drop constraint "pantry_items_user_id_fkey1";

drop function if exists "public"."handle_pantry_delete"();

drop function if exists "public"."handle_pantry_insert"();

drop function if exists "public"."checkout_list_items"(p_household_id uuid);

alter type "public"."pantry_event_type" rename to "pantry_event_type__old_version_to_be_dropped";

create type "public"."pantry_event_type" as enum ('consume', 'add', 'expire');


  create table "public"."pantry_batches" (
    "id" uuid not null default gen_random_uuid(),
    "grocery_item_id" uuid not null,
    "initial_quantity" bigint not null default '1'::bigint,
    "expires_at" timestamp with time zone,
    "household_id" uuid not null,
    "user_id" uuid,
    "remaining_quantity" bigint not null default '1'::bigint,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."pantry_batches" enable row level security;

alter table "public"."pantry_events" alter column event type "public"."pantry_event_type" using event::text::"public"."pantry_event_type";

drop type "public"."pantry_event_type__old_version_to_be_dropped";

alter table "public"."list_items" alter column "quantity" set default '0'::bigint;

alter table "public"."list_items" alter column "quantity" set not null;

alter table "public"."list_items" alter column "quantity" set data type bigint using "quantity"::bigint;

alter table "public"."pantry_events" drop column "grocery_item_id";

alter table "public"."pantry_events" drop column "household_id";

alter table "public"."pantry_events" add column "batch_id" uuid;

alter table "public"."pantry_events" add column "quantity" bigint not null default '1'::bigint;

alter table "public"."pantry_items" drop column "created_at";

alter table "public"."pantry_items" drop column "quantity";

alter table "public"."pantry_items" drop column "user_id";

alter table "public"."pantry_items" add column "total_quantity" bigint not null default '0'::bigint;

CREATE UNIQUE INDEX pantry_batches_pkey ON public.pantry_batches USING btree (id);

CREATE UNIQUE INDEX pantry_items_household_item_unique ON public.pantry_items USING btree (household_id, grocery_item_id);

alter table "public"."pantry_batches" add constraint "pantry_batches_pkey" PRIMARY KEY using index "pantry_batches_pkey";

alter table "public"."pantry_batches" add constraint "pantry_batches_grocery_item_id_fkey" FOREIGN KEY (grocery_item_id) REFERENCES public.grocery_items(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."pantry_batches" validate constraint "pantry_batches_grocery_item_id_fkey";

alter table "public"."pantry_batches" add constraint "pantry_batches_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pantry_batches" validate constraint "pantry_batches_household_id_fkey";

alter table "public"."pantry_batches" add constraint "pantry_batches_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."pantry_batches" validate constraint "pantry_batches_user_id_fkey";

alter table "public"."pantry_events" add constraint "pantry_events_batch_id_fkey" FOREIGN KEY (batch_id) REFERENCES public.pantry_batches(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."pantry_events" validate constraint "pantry_events_batch_id_fkey";

alter table "public"."pantry_items" add constraint "pantry_items_household_item_unique" UNIQUE using index "pantry_items_household_item_unique";

set check_function_bodies = off;

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

    insert into pantry_items (
      household_id,
      grocery_item_id,
      total_quantity
    )
    values (
      p_household_id,
      (v_item->>'grocery_item_id')::uuid,
      (v_item->>'quantity')::integer
    )
    on conflict (household_id, grocery_item_id)
    do update
    set total_quantity = pantry_items.total_quantity + (v_item->>'quantity')::integer;

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

  select total_quantity
  into v_total
  from pantry_items
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id
  for update;

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

  -- update the pantry items to reflect consumption
  update pantry_items
  set total_quantity = total_quantity - p_quantity
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id;

  delete from pantry_items
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id
    and total_quantity = 0;
end;$function$
;

CREATE OR REPLACE FUNCTION public.checkout_list_items(p_household_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$declare
  v_user_id uuid := auth.uid();
  v_items jsonb;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  select jsonb_agg(
    jsonb_build_object(
      'grocery_item_id', grocery_item_id,
      'quantity', quantity,
      'expires_at', null
    )
  )
  into v_items
  from list_items li
  where li.household_id = p_household_id
    and li.checked = true;

  if v_items is null then
    raise exception 'Items are empty';
  end if;

  perform add_pantry_batches(p_household_id, v_items);

  delete from list_items li
  where li.household_id = p_household_id
    and li.checked = true;
end$function$
;

CREATE OR REPLACE FUNCTION public.merge_grocery_items(p_source_id uuid, p_target_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
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

  update pantry_items
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  update pantry_events
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  delete from grocery_items
  where id = p_source_id;

  return true;
end;
$function$
;

grant delete on table "public"."pantry_batches" to "anon";

grant insert on table "public"."pantry_batches" to "anon";

grant references on table "public"."pantry_batches" to "anon";

grant select on table "public"."pantry_batches" to "anon";

grant trigger on table "public"."pantry_batches" to "anon";

grant truncate on table "public"."pantry_batches" to "anon";

grant update on table "public"."pantry_batches" to "anon";

grant delete on table "public"."pantry_batches" to "authenticated";

grant insert on table "public"."pantry_batches" to "authenticated";

grant references on table "public"."pantry_batches" to "authenticated";

grant select on table "public"."pantry_batches" to "authenticated";

grant trigger on table "public"."pantry_batches" to "authenticated";

grant truncate on table "public"."pantry_batches" to "authenticated";

grant update on table "public"."pantry_batches" to "authenticated";

grant delete on table "public"."pantry_batches" to "postgres";

grant insert on table "public"."pantry_batches" to "postgres";

grant references on table "public"."pantry_batches" to "postgres";

grant select on table "public"."pantry_batches" to "postgres";

grant trigger on table "public"."pantry_batches" to "postgres";

grant truncate on table "public"."pantry_batches" to "postgres";

grant update on table "public"."pantry_batches" to "postgres";

grant delete on table "public"."pantry_batches" to "service_role";

grant insert on table "public"."pantry_batches" to "service_role";

grant references on table "public"."pantry_batches" to "service_role";

grant select on table "public"."pantry_batches" to "service_role";

grant trigger on table "public"."pantry_batches" to "service_role";

grant truncate on table "public"."pantry_batches" to "service_role";

grant update on table "public"."pantry_batches" to "service_role";


  create policy "Enable select based on role"
  on "public"."pantry_batches"
  as permissive
  for select
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable select based on role"
  on "public"."pantry_events"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM (public.pantry_batches pb
     JOIN public.household_users hu ON ((hu.household_id = pb.household_id)))
  WHERE ((pb.id = pantry_events.batch_id) AND (hu.user_id = auth.uid())))));



