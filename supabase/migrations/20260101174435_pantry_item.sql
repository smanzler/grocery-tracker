set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.remove_pantry_item(p_item_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$declare
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
      and hu.household_id = v_household_id
  ) then
    raise exception 'Unauthorized';
  end if;

  insert into pantry_events (household_id, grocery_item_id, user_id, event)
  values (v_household_id, v_grocery_item_id, v_user_id, 'remove');

  delete from pantry_items
  where id = p_item_id;

  return true;
end;$function$
;


