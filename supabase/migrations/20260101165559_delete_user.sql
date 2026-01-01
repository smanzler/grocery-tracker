set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_user()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
delete from auth.users
where id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.empty_pantry(p_household_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;
  
  delete from pantry_items
  where household_id = p_household_id;

  return true;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_invite_info_by_token(p_token text)
 RETURNS TABLE(household_id uuid, household_name text, household_image_url text, household_created_at timestamp with time zone, invite_id uuid, invite_expires_at timestamp with time zone, creator_id uuid, creator_display_name text, creator_username text, is_already_member boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  select 
    h.id as household_id,
    h.name as household_name,
    h.image_url as household_image_url,
    h.created_at as household_created_at,
    hi.id as invite_id,
    hi.expires_at as invite_expires_at,
    p.id as creator_id,
    p.display_name as creator_display_name,
    p.username as creator_username,
    exists (
      select 1 
      from household_users hu
      where hu.household_id = h.id 
        and hu.user_id = auth.uid()
    ) as is_already_member
  from household_invites hi
  join households h on h.id = hi.household_id
  join profiles p on p.id = h.user_id
  where hi.token = p_token
    and (hi.expires_at is null or hi.expires_at > now())
    and (hi.max_uses is null or hi.used_count < hi.max_uses)
  limit 1
$function$
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


