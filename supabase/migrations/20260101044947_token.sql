set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_household_invite(p_household_id uuid, p_expires_in_days integer DEFAULT 7)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$declare
  invite_token uuid;
  expires_at timestamptz;
begin
  invite_token := gen_random_uuid();

  expires_at := now() + (p_expires_in_days || ' days')::interval;

  insert into household_invites(
    household_id,
    token,
    created_at,
    expires_at,
    max_uses
  )
  values (
    p_household_id,
    invite_token::text,
    now(),
    expires_at,
    1
  );

  return invite_token;
end;$function$
;

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

grant delete on table "public"."grocery_items" to "postgres";

grant insert on table "public"."grocery_items" to "postgres";

grant references on table "public"."grocery_items" to "postgres";

grant select on table "public"."grocery_items" to "postgres";

grant trigger on table "public"."grocery_items" to "postgres";

grant truncate on table "public"."grocery_items" to "postgres";

grant update on table "public"."grocery_items" to "postgres";

grant delete on table "public"."pantry_events" to "postgres";

grant insert on table "public"."pantry_events" to "postgres";

grant references on table "public"."pantry_events" to "postgres";

grant select on table "public"."pantry_events" to "postgres";

grant trigger on table "public"."pantry_events" to "postgres";

grant truncate on table "public"."pantry_events" to "postgres";

grant update on table "public"."pantry_events" to "postgres";


