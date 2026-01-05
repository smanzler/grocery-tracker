
create extension if not exists "pgjwt" with schema "extensions";

drop policy "Enable insert for users based on user_id" on "public"."grocery_items";

drop policy "Enable read access for global items" on "public"."grocery_items";

drop policy "Enable select based on role" on "public"."grocery_items";

drop policy "Enable select for users based on user_id" on "public"."grocery_items";

drop policy "Restrict insert for global items" on "public"."grocery_items";


  create policy "Combined insert policy"
  on "public"."grocery_items"
  as permissive
  for insert
  to authenticated
with check (((( SELECT auth.uid() AS uid) = user_id) AND ((household_id IS NULL) OR public.is_household_user(household_id)) AND (is_global = false)));



  create policy "Combined select policy"
  on "public"."grocery_items"
  as permissive
  for select
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) OR public.is_household_user(household_id) OR (is_global = true)));



  create policy "Disable select for now"
  on "public"."pantry_events"
  as permissive
  for select
  to authenticated
using (false);