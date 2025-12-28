
  create table "public"."list_items" (
    "id" uuid not null default gen_random_uuid(),
    "list_id" uuid not null,
    "user_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text,
    "quantity" smallint not null default '1'::smallint
      );


alter table "public"."list_items" enable row level security;


  create table "public"."list_roles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "list_id" uuid not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."list_roles" enable row level security;


  create table "public"."lists" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "name" text,
    "image_url" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."lists" enable row level security;

CREATE UNIQUE INDEX list_items_pkey ON public.list_items USING btree (id);

CREATE UNIQUE INDEX list_roles_pkey ON public.list_roles USING btree (id);

CREATE UNIQUE INDEX lists_pkey ON public.lists USING btree (id);

alter table "public"."list_items" add constraint "list_items_pkey" PRIMARY KEY using index "list_items_pkey";

alter table "public"."list_roles" add constraint "list_roles_pkey" PRIMARY KEY using index "list_roles_pkey";

alter table "public"."lists" add constraint "lists_pkey" PRIMARY KEY using index "lists_pkey";

alter table "public"."list_items" add constraint "list_items_list_id_fkey" FOREIGN KEY (list_id) REFERENCES public.lists(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_list_id_fkey";

alter table "public"."list_items" add constraint "list_items_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_items" validate constraint "list_items_user_id_fkey";

alter table "public"."list_roles" add constraint "list_roles_list_id_fkey" FOREIGN KEY (list_id) REFERENCES public.lists(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_roles" validate constraint "list_roles_list_id_fkey";

alter table "public"."list_roles" add constraint "list_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."list_roles" validate constraint "list_roles_user_id_fkey";

alter table "public"."lists" add constraint "lists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON UPDATE RESTRICT ON DELETE RESTRICT not valid;

alter table "public"."lists" validate constraint "lists_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_list_user(p_list_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
  select exists (
    select 1
    from list_roles
    where user_id = auth.uid()
      and list_id = p_list_id
  );
$function$
;

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

grant delete on table "public"."list_items" to "postgres";

grant insert on table "public"."list_items" to "postgres";

grant references on table "public"."list_items" to "postgres";

grant select on table "public"."list_items" to "postgres";

grant trigger on table "public"."list_items" to "postgres";

grant truncate on table "public"."list_items" to "postgres";

grant update on table "public"."list_items" to "postgres";

grant delete on table "public"."list_items" to "service_role";

grant insert on table "public"."list_items" to "service_role";

grant references on table "public"."list_items" to "service_role";

grant select on table "public"."list_items" to "service_role";

grant trigger on table "public"."list_items" to "service_role";

grant truncate on table "public"."list_items" to "service_role";

grant update on table "public"."list_items" to "service_role";

grant delete on table "public"."list_roles" to "anon";

grant insert on table "public"."list_roles" to "anon";

grant references on table "public"."list_roles" to "anon";

grant select on table "public"."list_roles" to "anon";

grant trigger on table "public"."list_roles" to "anon";

grant truncate on table "public"."list_roles" to "anon";

grant update on table "public"."list_roles" to "anon";

grant delete on table "public"."list_roles" to "authenticated";

grant insert on table "public"."list_roles" to "authenticated";

grant references on table "public"."list_roles" to "authenticated";

grant select on table "public"."list_roles" to "authenticated";

grant trigger on table "public"."list_roles" to "authenticated";

grant truncate on table "public"."list_roles" to "authenticated";

grant update on table "public"."list_roles" to "authenticated";

grant delete on table "public"."list_roles" to "postgres";

grant insert on table "public"."list_roles" to "postgres";

grant references on table "public"."list_roles" to "postgres";

grant select on table "public"."list_roles" to "postgres";

grant trigger on table "public"."list_roles" to "postgres";

grant truncate on table "public"."list_roles" to "postgres";

grant update on table "public"."list_roles" to "postgres";

grant delete on table "public"."list_roles" to "service_role";

grant insert on table "public"."list_roles" to "service_role";

grant references on table "public"."list_roles" to "service_role";

grant select on table "public"."list_roles" to "service_role";

grant trigger on table "public"."list_roles" to "service_role";

grant truncate on table "public"."list_roles" to "service_role";

grant update on table "public"."list_roles" to "service_role";

grant delete on table "public"."lists" to "anon";

grant insert on table "public"."lists" to "anon";

grant references on table "public"."lists" to "anon";

grant select on table "public"."lists" to "anon";

grant trigger on table "public"."lists" to "anon";

grant truncate on table "public"."lists" to "anon";

grant update on table "public"."lists" to "anon";

grant delete on table "public"."lists" to "authenticated";

grant insert on table "public"."lists" to "authenticated";

grant references on table "public"."lists" to "authenticated";

grant select on table "public"."lists" to "authenticated";

grant trigger on table "public"."lists" to "authenticated";

grant truncate on table "public"."lists" to "authenticated";

grant update on table "public"."lists" to "authenticated";

grant delete on table "public"."lists" to "postgres";

grant insert on table "public"."lists" to "postgres";

grant references on table "public"."lists" to "postgres";

grant select on table "public"."lists" to "postgres";

grant trigger on table "public"."lists" to "postgres";

grant truncate on table "public"."lists" to "postgres";

grant update on table "public"."lists" to "postgres";

grant delete on table "public"."lists" to "service_role";

grant insert on table "public"."lists" to "service_role";

grant references on table "public"."lists" to "service_role";

grant select on table "public"."lists" to "service_role";

grant trigger on table "public"."lists" to "service_role";

grant truncate on table "public"."lists" to "service_role";

grant update on table "public"."lists" to "service_role";


  create policy "Enable delete based on role"
  on "public"."list_items"
  as permissive
  for delete
  to authenticated
using (public.is_list_user(list_id));



  create policy "Enable insert based on role"
  on "public"."list_items"
  as permissive
  for insert
  to authenticated
with check (public.is_list_user(list_id));



  create policy "Enable select based on role"
  on "public"."list_items"
  as permissive
  for select
  to authenticated
using (public.is_list_user(list_id));



  create policy "Enable update based on role"
  on "public"."list_items"
  as permissive
  for update
  to authenticated
using (public.is_list_user(list_id));



  create policy "Enable insert based on role"
  on "public"."list_roles"
  as permissive
  for insert
  to authenticated
with check (public.is_list_user(list_id));



  create policy "Enable insert based on user_id"
  on "public"."list_roles"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM public.lists l
  WHERE ((l.id = list_roles.list_id) AND (l.user_id = ( SELECT auth.uid() AS uid))))));



  create policy "Enable select based on role"
  on "public"."list_roles"
  as permissive
  for select
  to authenticated
using (public.is_list_user(list_id));



  create policy "Enable insert for users based on user_id"
  on "public"."lists"
  as permissive
  for insert
  to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));



  create policy "Enable select based on role"
  on "public"."lists"
  as permissive
  for select
  to authenticated
using (public.is_list_user(id));



