
  create table "public"."household_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "household_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."household_roles" enable row level security;


  create table "public"."households" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text,
    "image_url" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."households" enable row level security;


  create table "public"."list_items" (
    "id" uuid not null default gen_random_uuid(),
    "household_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "quantity" smallint not null default '1'::smallint
      );


alter table "public"."list_items" enable row level security;

CREATE UNIQUE INDEX list_items_pkey ON public.list_items USING btree (id);

CREATE UNIQUE INDEX household_roles_pkey ON public.household_roles USING btree (id);

CREATE UNIQUE INDEX households_pkey ON public.households USING btree (id);

alter table "public"."household_roles" add constraint "household_roles_pkey" PRIMARY KEY using index "household_roles_pkey";

alter table "public"."households" add constraint "households_pkey" PRIMARY KEY using index "households_pkey";

alter table "public"."list_items" add constraint "list_items_pkey" PRIMARY KEY using index "list_items_pkey";

alter table "public"."household_roles" add constraint "household_roles_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."household_roles" validate constraint "household_roles_household_id_fkey";

alter table "public"."household_roles" add constraint "household_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."household_roles" validate constraint "household_roles_user_id_fkey";

alter table "public"."households" add constraint "households_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT not valid;

alter table "public"."households" validate constraint "households_user_id_fkey";

alter table "public"."list_items" add constraint "list_items_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_household_id_fkey";

alter table "public"."list_items" add constraint "list_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_household_user(p_household_id uuid)
 RETURNS boolean
 LANGUAGE sql
AS $function$
select exists (
  select 1
  from household_roles hr
  where hr.user_id = (select auth.uid())
    and hr.household_id = p_household_id
);
$function$
;

grant delete on table "public"."household_roles" to "anon";

grant insert on table "public"."household_roles" to "anon";

grant references on table "public"."household_roles" to "anon";

grant select on table "public"."household_roles" to "anon";

grant trigger on table "public"."household_roles" to "anon";

grant truncate on table "public"."household_roles" to "anon";

grant update on table "public"."household_roles" to "anon";

grant delete on table "public"."household_roles" to "authenticated";

grant insert on table "public"."household_roles" to "authenticated";

grant references on table "public"."household_roles" to "authenticated";

grant select on table "public"."household_roles" to "authenticated";

grant trigger on table "public"."household_roles" to "authenticated";

grant truncate on table "public"."household_roles" to "authenticated";

grant update on table "public"."household_roles" to "authenticated";

grant delete on table "public"."household_roles" to "service_role";

grant insert on table "public"."household_roles" to "service_role";

grant references on table "public"."household_roles" to "service_role";

grant select on table "public"."household_roles" to "service_role";

grant trigger on table "public"."household_roles" to "service_role";

grant truncate on table "public"."household_roles" to "service_role";

grant update on table "public"."household_roles" to "service_role";

grant delete on table "public"."households" to "anon";

grant insert on table "public"."households" to "anon";

grant references on table "public"."households" to "anon";

grant select on table "public"."households" to "anon";

grant trigger on table "public"."households" to "anon";

grant truncate on table "public"."households" to "anon";

grant update on table "public"."households" to "anon";

grant delete on table "public"."households" to "authenticated";

grant insert on table "public"."households" to "authenticated";

grant references on table "public"."households" to "authenticated";

grant select on table "public"."households" to "authenticated";

grant trigger on table "public"."households" to "authenticated";

grant truncate on table "public"."households" to "authenticated";

grant update on table "public"."households" to "authenticated";

grant delete on table "public"."households" to "service_role";

grant insert on table "public"."households" to "service_role";

grant references on table "public"."households" to "service_role";

grant select on table "public"."households" to "service_role";

grant trigger on table "public"."households" to "service_role";

grant truncate on table "public"."households" to "service_role";

grant update on table "public"."households" to "service_role";

grant delete on table "public"."list_items" to "anon";

grant insert on table "public"."list_items" to "anon";

grant references on table "public"."list_items" to "anon";

grant select on table "public"."list_items" to "anon";

grant trigger on table "public"."list_items" to "anon";

grant truncate on table "public"."list_items" to "anon";

grant update on table "public"."list_items" to "anon";

grant delete on table "public"."list_items" to "authenticated";

grant insert on table "public"."list_items" to "authenticated";

grant references on table "public"."list_items" to "authenticated";

grant select on table "public"."list_items" to "authenticated";

grant trigger on table "public"."list_items" to "authenticated";

grant truncate on table "public"."list_items" to "authenticated";

grant update on table "public"."list_items" to "authenticated";

grant delete on table "public"."list_items" to "service_role";

grant insert on table "public"."list_items" to "service_role";

grant references on table "public"."list_items" to "service_role";

grant select on table "public"."list_items" to "service_role";

grant trigger on table "public"."list_items" to "service_role";

grant truncate on table "public"."list_items" to "service_role";

grant update on table "public"."list_items" to "service_role";


  create policy "Enable insert based on role"
  on "public"."household_roles"
  as permissive
  for insert
  to authenticated
with check (public.is_household_user(household_id));



  create policy "Enable insert based on user_id"
  on "public"."household_roles"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.households h
  WHERE ((h.id = household_roles.household_id) AND (h.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable select based on role"
  on "public"."household_roles"
  as permissive
  for select
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable insert for users based on user_id"
  on "public"."households"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable select based on role"
  on "public"."households"
  as permissive
  for select
  to authenticated
using (public.is_household_user(id));



  create policy "Enable delete based on role"
  on "public"."list_items"
  as permissive
  for delete
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable insert based on role"
  on "public"."list_items"
  as permissive
  for insert
  to authenticated
with check (public.is_household_user(household_id));



  create policy "Enable select based on role"
  on "public"."list_items"
  as permissive
  for select
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable update based on role"
  on "public"."list_items"
  as permissive
  for update
  to authenticated
using (public.is_household_user(household_id));



