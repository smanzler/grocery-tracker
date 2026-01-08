import { supabase } from "@/lib/supabase";

export const getPantryEvents = async (
  householdId: string,
  groceryItemId: string
) => {
  const { data, error } = await supabase
    .from("pantry_events")
    .select("*")
    .eq("household_id", householdId)
    .eq("grocery_item_id", groceryItemId);
  if (error) throw error;
  return data;
};
