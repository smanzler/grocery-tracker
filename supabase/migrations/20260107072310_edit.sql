drop policy "Disable select for now" on "public"."pantry_events";

drop function if exists "public"."empty_pantry"(p_household_id uuid);

drop function if exists "public"."remove_pantry_item"(p_item_id uuid);


  create policy "Combined delete policy"
  on "public"."grocery_items"
  as permissive
  for delete
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) AND ((household_id IS NULL) OR public.is_household_user(household_id)) AND (is_global = false)));



  create policy "Combined update policy"
  on "public"."grocery_items"
  as permissive
  for update
  to authenticated
using (((( SELECT auth.uid() AS uid) = user_id) AND ((household_id IS NULL) OR public.is_household_user(household_id)) AND (is_global = false)))
with check (((( SELECT auth.uid() AS uid) = user_id) AND ((household_id IS NULL) OR public.is_household_user(household_id)) AND (is_global = false)));



  create policy "Enable select based on role"
  on "public"."pantry_events"
  as permissive
  for select
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable delete based on role"
  on "public"."pantry_items"
  as permissive
  for delete
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable insert based on role"
  on "public"."pantry_items"
  as permissive
  for insert
  to authenticated
with check (public.is_household_user(household_id));



