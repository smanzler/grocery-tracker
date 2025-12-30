
  create table "public"."pantry_items" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "user_id" uuid not null,
    "household_id" uuid not null,
    "name" text not null,
    "quantity" smallint
      );


alter table "public"."pantry_items" enable row level security;

alter table "public"."household_invites" alter column "created_at" set not null;

alter table "public"."household_invites" alter column "household_id" set not null;

alter table "public"."list_items" drop column "completed";

alter table "public"."list_items" add column "checked" boolean not null default false;

alter table "public"."list_items" alter column "name" set not null;

alter table "public"."list_items" alter column "quantity" drop default;

alter table "public"."list_items" alter column "quantity" drop not null;

CREATE UNIQUE INDEX pantry_items_pkey ON public.pantry_items USING btree (id);

alter table "public"."pantry_items" add constraint "pantry_items_pkey" PRIMARY KEY using index "pantry_items_pkey";

alter table "public"."pantry_items" add constraint "pantry_items_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pantry_items" validate constraint "pantry_items_household_id_fkey";

alter table "public"."pantry_items" add constraint "pantry_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."pantry_items" validate constraint "pantry_items_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.checkout_list_items(p_household_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  insert into pantry_items (user_id, household_id, name, quantity)
  select
    user_id,
    household_id,
    name,
    quantity
  from list_items li
  where li.user_id = v_user_id
    and li.household_id = p_household_id
    and li.checked = true;

  delete from list_items li
  where li.user_id = v_user_id
    and li.household_id = p_household_id
    and li.checked = true;
  
  return true;
end;$function$
;

grant delete on table "public"."pantry_items" to "anon";

grant insert on table "public"."pantry_items" to "anon";

grant references on table "public"."pantry_items" to "anon";

grant select on table "public"."pantry_items" to "anon";

grant trigger on table "public"."pantry_items" to "anon";

grant truncate on table "public"."pantry_items" to "anon";

grant update on table "public"."pantry_items" to "anon";

grant delete on table "public"."pantry_items" to "authenticated";

grant insert on table "public"."pantry_items" to "authenticated";

grant references on table "public"."pantry_items" to "authenticated";

grant select on table "public"."pantry_items" to "authenticated";

grant trigger on table "public"."pantry_items" to "authenticated";

grant truncate on table "public"."pantry_items" to "authenticated";

grant update on table "public"."pantry_items" to "authenticated";

grant delete on table "public"."pantry_items" to "service_role";

grant insert on table "public"."pantry_items" to "service_role";

grant references on table "public"."pantry_items" to "service_role";

grant select on table "public"."pantry_items" to "service_role";

grant trigger on table "public"."pantry_items" to "service_role";

grant truncate on table "public"."pantry_items" to "service_role";

grant update on table "public"."pantry_items" to "service_role";


