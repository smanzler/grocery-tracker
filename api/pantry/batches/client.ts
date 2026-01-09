import { supabase } from "@/lib/supabase";
import { PantryBatchesFilters } from "./queries";

export const getPantryBatches = async (filters: PantryBatchesFilters) => {
  const query = supabase
    .from("pantry_batches")
    .select("*, grocery_item:grocery_item_id(*)")
    .eq("household_id", filters.householdId!);

  if (filters.itemId) {
    query.eq("grocery_item_id", filters.itemId);
  }

  if (filters.active) {
    query.gt("remaining_quantity", 0);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
