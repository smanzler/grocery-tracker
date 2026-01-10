import { supabase } from "@/lib/supabase";

export const getPantryEvents = async (
  householdId: string,
  groceryItemId: string
) => {
  const { data, error } = await supabase
    .from("pantry_events")
    .select("*, pantry_batches(id, expires_at)")
    .eq("pantry_batches.household_id", householdId)
    .eq("pantry_batches.grocery_item_id", groceryItemId);
  if (error) throw error;
  return data;
};
