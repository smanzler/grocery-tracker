drop policy "Enable insert for users based on user_id" on "public"."grocery_items";

alter table "public"."grocery_items" add column "household_id" uuid;

alter table "public"."grocery_items" add constraint "grocery_items_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."grocery_items" validate constraint "grocery_items_household_id_fkey";

set check_function_bodies = off;

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


  create policy "Enable select based on role"
  on "public"."grocery_items"
  as permissive
  for select
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable insert for users based on user_id"
  on "public"."grocery_items"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) = user_id) AND ((household_id IS NULL) OR public.is_household_user(household_id))));



