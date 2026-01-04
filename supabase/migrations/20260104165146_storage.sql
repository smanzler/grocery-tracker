drop policy "Enable update based on role" on "public"."households";

alter table "public"."households" drop column "image_url";

alter table "public"."households" add column "image_path" text;


drop function if exists "public"."create_household"(p_name text, p_image_url text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_household(p_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  insert into households (name, user_id)
  values (p_name, v_user_id)
  returning id into v_household_id;

  insert into household_users (household_id, user_id)
  values (v_household_id, v_user_id);

  return v_household_id;
end;
$function$
;


  create policy "Enable update based on user_id"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((( SELECT auth.uid() AS uid) = id))
with check ((( SELECT auth.uid() AS uid) = id));



  create policy "Enable update based on role"
  on "public"."households"
  as permissive
  for update
  to authenticated
using (public.is_household_user(id))
with check (public.is_household_user(id));



insert into "storage"."buckets" (id, name, public) values ('avatars', 'avatars', true);
insert into "storage"."buckets" (id, name, public) values ('households', 'households', false);



  create policy "Users can manage their files 1oj01fe_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Users can manage their files 1oj01fe_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Users can manage their files 1oj01fe_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Users can manage their files 1oj01fe_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'avatars'::text) AND (( SELECT (auth.uid())::text AS uid) = (storage.foldername(name))[1])));



  create policy "Users can manage their households files x1vo1g_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'households'::text) AND (EXISTS ( SELECT 1
   FROM public.household_users hu
  WHERE ((hu.user_id = ( SELECT auth.uid() AS uid)) AND ((hu.household_id)::text = (storage.foldername(objects.name))[1]))))));



  create policy "Users can manage their households files x1vo1g_1"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'households'::text) AND (EXISTS ( SELECT 1
   FROM public.household_users hu
  WHERE ((hu.user_id = ( SELECT auth.uid() AS uid)) AND ((hu.household_id)::text = (storage.foldername(objects.name))[1]))))));



  create policy "Users can manage their households files x1vo1g_2"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'households'::text) AND (EXISTS ( SELECT 1
   FROM public.household_users hu
  WHERE ((hu.user_id = ( SELECT auth.uid() AS uid)) AND ((hu.household_id)::text = (storage.foldername(objects.name))[1]))))));



  create policy "Users can manage their households files x1vo1g_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'households'::text) AND (EXISTS ( SELECT 1
   FROM public.household_users hu
  WHERE ((hu.user_id = ( SELECT auth.uid() AS uid)) AND ((hu.household_id)::text = (storage.foldername(objects.name))[1]))))));



