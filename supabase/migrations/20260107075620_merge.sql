set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.merge_grocery_items(p_source_id uuid, p_target_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_source_item record;
  v_target_item record;
begin
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select * into v_source_item
  from grocery_items
  where id = p_source_id;

  select * into v_target_item
  from grocery_items
  where id = p_target_id;

  if v_source_item is null then
    raise exception 'Source grocery item not found';
  end if;

  if v_target_item is null then
    raise exception 'Target grocery item not found';
  end if;

  if v_source_item.user_id != v_user_id then
    if v_source_item.household_id is not null then
      if not is_household_user(v_source_item.household_id) then
        raise exception 'Unauthorized to merge source item';
      end if;
    else
      raise exception 'Unauthorized to merge source item';
    end if;
  end if;

  if v_source_item.is_global = true then
    raise exception 'Cannot merge global items';
  end if;

  -- updates
  
  update list_items
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  update pantry_items
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  update pantry_events
  set grocery_item_id = p_target_id
  where grocery_item_id = p_source_id;

  delete from grocery_items
  where id = p_source_id;

  return true;
end;
$function$
;


