
  create table "public"."household_users" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "household_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."household_users" enable row level security;


  create table "public"."households" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null default auth.uid(),
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
    "quantity" smallint not null default '1'::smallint,
    "completed" boolean not null default false
      );


alter table "public"."list_items" enable row level security;

CREATE UNIQUE INDEX household_users_pkey ON public.household_users USING btree (id);

CREATE UNIQUE INDEX household_users_unique ON public.household_users USING btree (user_id, household_id);

CREATE UNIQUE INDEX households_pkey ON public.households USING btree (id);

CREATE UNIQUE INDEX list_items_pkey ON public.list_items USING btree (id);

alter table "public"."household_users" add constraint "household_users_pkey" PRIMARY KEY using index "household_users_pkey";

alter table "public"."households" add constraint "households_pkey" PRIMARY KEY using index "households_pkey";

alter table "public"."list_items" add constraint "list_items_pkey" PRIMARY KEY using index "list_items_pkey";

alter table "public"."household_users" add constraint "household_users_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."household_users" validate constraint "household_users_household_id_fkey";

alter table "public"."household_users" add constraint "household_users_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."household_users" validate constraint "household_users_user_id_fkey";

alter table "public"."household_users" add constraint "household_users_unique" UNIQUE using index "household_users_unique";

alter table "public"."households" add constraint "households_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT not valid;

alter table "public"."households" validate constraint "households_user_id_fkey";

alter table "public"."list_items" add constraint "list_items_household_id_fkey" FOREIGN KEY (household_id) REFERENCES public.households(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_household_id_fkey";

alter table "public"."list_items" add constraint "list_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_household_user(p_household_id uuid, p_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_target_id uuid;
  v_row_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not exists (
    select 1 from household_users hu
    where hu.user_id = v_user_id
      and hu.household_id = p_household_id
  ) then
    raise exception 'Unauthorized';
  end if;

  select id into v_target_id
  from auth.users
  where email = p_email;

  if v_target_id is null then
    raise exception 'User with email not found';
  end if;

  insert into household_users (user_id, household_id)
  values (v_target_id, p_household_id)
  on conflict (user_id, household_id) do nothing
  returning id into v_row_id;

  return v_row_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_household(p_name text, p_image_url text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_household_id uuid;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  insert into households (name, image_url, user_id)
  values (p_name, p_image_url, v_user_id)
  returning id into v_household_id;

  insert into household_users (household_id, user_id)
  values (v_household_id, v_user_id);

  return v_household_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_household_user(p_household_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public, auth
AS $function$
select exists (
  select 1
  from household_users hu
  where hu.user_id = (select auth.uid())
    and hu.household_id = p_household_id
);
$function$
;

grant delete on table "public"."household_users" to "anon";

grant insert on table "public"."household_users" to "anon";

grant references on table "public"."household_users" to "anon";

grant select on table "public"."household_users" to "anon";

grant trigger on table "public"."household_users" to "anon";

grant truncate on table "public"."household_users" to "anon";

grant update on table "public"."household_users" to "anon";

grant delete on table "public"."household_users" to "authenticated";

grant insert on table "public"."household_users" to "authenticated";

grant references on table "public"."household_users" to "authenticated";

grant select on table "public"."household_users" to "authenticated";

grant trigger on table "public"."household_users" to "authenticated";

grant truncate on table "public"."household_users" to "authenticated";

grant update on table "public"."household_users" to "authenticated";

grant delete on table "public"."household_users" to "service_role";

grant insert on table "public"."household_users" to "service_role";

grant references on table "public"."household_users" to "service_role";

grant select on table "public"."household_users" to "service_role";

grant trigger on table "public"."household_users" to "service_role";

grant truncate on table "public"."household_users" to "service_role";

grant update on table "public"."household_users" to "service_role";

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


  create policy "Enable delete based on role"
  on "public"."household_users"
  as permissive
  for delete
  to authenticated
using (public.is_household_user(household_id));



  create policy "Enable insert based on role"
  on "public"."household_users"
  as permissive
  for insert
  to authenticated
with check (public.is_household_user(household_id));



  create policy "Enable select based on role"
  on "public"."household_users"
  as permissive
  for select
  to authenticated
using (public.is_household_user(household_id));



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



