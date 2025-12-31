import { supabase } from "@/lib/supabase";

export const getPantryItems = async (householdId: string) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*, grocery_items(name), profiles(display_name)")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const removePantryItem = async (itemId: string) => {
  const { data, error } = await supabase.rpc("remove_pantry_item", {
    p_item_id: itemId,
  });
  if (error) throw error;
  return data;
};
