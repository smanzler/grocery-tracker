set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_pantry_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into pantry_events (grocery_item_id, household_id, user_id, event)
  values (old.grocery_item_id, old.household_id, old.user_id, 'remove');

  return old;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_pantry_insert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into pantry_events (grocery_item_id, household_id, user_id, event)
  values (new.grocery_item_id, new.household_id, new.user_id, 'add');

  return new;
end;
$function$
;

CREATE TRIGGER on_pantry_delete BEFORE DELETE ON public.pantry_items FOR EACH ROW EXECUTE FUNCTION public.handle_pantry_delete();

CREATE TRIGGER on_pantry_insert AFTER INSERT ON public.pantry_items FOR EACH ROW EXECUTE FUNCTION public.handle_pantry_insert();


