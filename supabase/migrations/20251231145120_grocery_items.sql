create type "public"."pantry_event_type" as enum ('add', 'restock', 'consume', 'remove');


  create table "public"."grocery_items" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid,
    "name" text
      );


alter table "public"."grocery_items" enable row level security;


  create table "public"."pantry_events" (
    "id" uuid not null default gen_random_uuid(),
    "household_id" uuid,
    "grocery_item_id" uuid,
    "user_id" uuid,
    "event" public.pantry_event_type not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."pantry_events" enable row level security;

alter table "public"."list_items" drop column "name";

alter table "public"."list_items" add column "grocery_item_id" uuid not null;

alter table "public"."pantry_items" drop column "name";

alter table "public"."pantry_items" add column "grocery_item_id" uuid not null;

CREATE UNIQUE INDEX grocery_items_pkey ON public.grocery_items USING btree (id);

CREATE UNIQUE INDEX pantry_events_pkey ON public.pantry_events USING btree (id);

alter table "public"."grocery_items" add constraint "grocery_items_pkey" PRIMARY KEY using index "grocery_items_pkey";

alter table "public"."pantry_events" add constraint "pantry_events_pkey" PRIMARY KEY using index "pantry_events_pkey";

alter table "public"."grocery_items" add constraint "grocery_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."grocery_items" validate constraint "grocery_items_user_id_fkey";

alter table "public"."list_items" add constraint "list_items_grocery_item_id_fkey" FOREIGN KEY (grocery_item_id) REFERENCES public.grocery_items(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_grocery_item_id_fkey";

alter table "public"."pantry_events" add constraint "pantry_events_grocery_item_id_fkey" FOREIGN KEY (grocery_item_id) REFERENCES public.grocery_items(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pantry_events" validate constraint "pantry_events_grocery_item_id_fkey";

alter table "public"."pantry_events" add constraint "pantry_events_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pantry_events" validate constraint "pantry_events_household_id_fkey";

alter table "public"."pantry_events" add constraint "pantry_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."pantry_events" validate constraint "pantry_events_user_id_fkey";

alter table "public"."pantry_items" add constraint "pantry_items_grocery_item_id_fkey" FOREIGN KEY (grocery_item_id) REFERENCES public.grocery_items(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pantry_items" validate constraint "pantry_items_grocery_item_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.remove_pantry_item(p_item_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
  v_grocery_item_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select pi.household_id, pi.grocery_item_id into v_household_id, v_grocery_item_id
  from pantry_items pi
  where pi.id = p_item_id;

  if v_household_id is null then
    raise exception 'Item not found';
  end if;

  if not exists (
    select 1
    from household_users hu
    where hu.user_id = v_user_id
      and hu.household = v_household_id
  ) then
    raise exception 'Unauthorized';
  end if;

  insert into pantry_events (household_id, grocery_item_id, user_id, event)
  values (v_household_id, v_grocery_item_id, v_user_id, 'remove');

  delete from pantry_items
  where item_id = p_item_id;

  return true;
end;
$function$
;

grant delete on table "public"."grocery_items" to "anon";

grant insert on table "public"."grocery_items" to "anon";

grant references on table "public"."grocery_items" to "anon";

grant select on table "public"."grocery_items" to "anon";

grant trigger on table "public"."grocery_items" to "anon";

grant truncate on table "public"."grocery_items" to "anon";

grant update on table "public"."grocery_items" to "anon";

grant delete on table "public"."grocery_items" to "authenticated";

grant insert on table "public"."grocery_items" to "authenticated";

grant references on table "public"."grocery_items" to "authenticated";

grant select on table "public"."grocery_items" to "authenticated";

grant trigger on table "public"."grocery_items" to "authenticated";

grant truncate on table "public"."grocery_items" to "authenticated";

grant update on table "public"."grocery_items" to "authenticated";

grant delete on table "public"."grocery_items" to "postgres";

grant insert on table "public"."grocery_items" to "postgres";

grant references on table "public"."grocery_items" to "postgres";

grant select on table "public"."grocery_items" to "postgres";

grant trigger on table "public"."grocery_items" to "postgres";

grant truncate on table "public"."grocery_items" to "postgres";

grant update on table "public"."grocery_items" to "postgres";

grant delete on table "public"."grocery_items" to "service_role";

grant insert on table "public"."grocery_items" to "service_role";

grant references on table "public"."grocery_items" to "service_role";

grant select on table "public"."grocery_items" to "service_role";

grant trigger on table "public"."grocery_items" to "service_role";

grant truncate on table "public"."grocery_items" to "service_role";

grant update on table "public"."grocery_items" to "service_role";

grant delete on table "public"."pantry_events" to "anon";

grant insert on table "public"."pantry_events" to "anon";

grant references on table "public"."pantry_events" to "anon";

grant select on table "public"."pantry_events" to "anon";

grant trigger on table "public"."pantry_events" to "anon";

grant truncate on table "public"."pantry_events" to "anon";

grant update on table "public"."pantry_events" to "anon";

grant delete on table "public"."pantry_events" to "authenticated";

grant insert on table "public"."pantry_events" to "authenticated";

grant references on table "public"."pantry_events" to "authenticated";

grant select on table "public"."pantry_events" to "authenticated";

grant trigger on table "public"."pantry_events" to "authenticated";

grant truncate on table "public"."pantry_events" to "authenticated";

grant update on table "public"."pantry_events" to "authenticated";

grant delete on table "public"."pantry_events" to "postgres";

grant insert on table "public"."pantry_events" to "postgres";

grant references on table "public"."pantry_events" to "postgres";

grant select on table "public"."pantry_events" to "postgres";

grant trigger on table "public"."pantry_events" to "postgres";

grant truncate on table "public"."pantry_events" to "postgres";

grant update on table "public"."pantry_events" to "postgres";

grant delete on table "public"."pantry_events" to "service_role";

grant insert on table "public"."pantry_events" to "service_role";

grant references on table "public"."pantry_events" to "service_role";

grant select on table "public"."pantry_events" to "service_role";

grant trigger on table "public"."pantry_events" to "service_role";

grant truncate on table "public"."pantry_events" to "service_role";

grant update on table "public"."pantry_events" to "service_role";


