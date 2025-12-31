alter table "public"."household_users" drop constraint "household_users_user_id_fkey";

alter table "public"."households" drop constraint "households_user_id_fkey";

alter table "public"."list_items" drop constraint "list_items_user_id_fkey";

alter table "public"."pantry_items" drop constraint "pantry_items_user_id_fkey";

alter table "public"."household_users" add constraint "household_users_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."household_users" validate constraint "household_users_user_id_fkey1";

alter table "public"."households" add constraint "households_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."households" validate constraint "households_user_id_fkey1";

alter table "public"."list_items" add constraint "list_items_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_user_id_fkey1";

alter table "public"."pantry_items" add constraint "pantry_items_user_id_fkey1" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."pantry_items" validate constraint "pantry_items_user_id_fkey1";


  create policy "Enable read access for all users"
  on "public"."profiles"
  as permissive
  for select
  to public
using (true);



