drop policy "Enable delete based on role" on "public"."list_items";

drop policy "Enable insert based on role" on "public"."list_items";

drop policy "Enable update based on role" on "public"."list_items";

alter table "public"."list_items" drop column "quantity";

alter table "public"."list_items" add column "total_quantity" bigint not null default '0'::bigint;

CREATE UNIQUE INDEX list_items_household_item_unique ON public.list_items USING btree (household_id, grocery_item_id);

alter table "public"."list_items" add constraint "list_items_household_item_unique" UNIQUE using index "list_items_household_item_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_list_item(p_household_id uuid, p_grocery_item_id uuid, p_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  insert into list_items (
    household_id,
    user_id,
    grocery_item_id,
    total_quantity
  )
  values (
    p_household_id,
    v_user_id,
    p_grocery_item_id,
    p_quantity
  )
  on conflict (household_id, grocery_item_id)
  do update
  set total_quantity = list_items.total_quantity + p_quantity;
end;$function$
;

CREATE OR REPLACE FUNCTION public.remove_list_item(p_household_id uuid, p_grocery_item_id uuid, p_quantity integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_total integer;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  if p_quantity <= 0 then
    raise exception 'Quantity must be positive';
  end if;

  select total_quantity
  into v_total
  from list_items
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id
  for update;

  if v_total is null then
    raise exception 'Item not on grocery list';
  end if;

  if v_total < p_quantity then
    raise exception 'Cannot remove more than exists';
  end if;

  update list_items
  set total_quantity = total_quantity - p_quantity
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id;

  delete from list_items
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id
    and total_quantity = 0;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.toggle_list_item_checked(p_household_id uuid, p_grocery_item_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_checked boolean;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  if not is_household_user(p_household_id) then
    raise exception 'Unauthorized';
  end if;

  update list_items
  set checked = not checked
  where household_id = p_household_id
    and grocery_item_id = p_grocery_item_id
  returning checked into v_checked;

  if v_checked is null then
    raise exception 'Item not found';
  end if;

  return v_checked;
end;
$function$
;


