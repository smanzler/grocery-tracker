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

export const emptyPantry = async (householdId: string) => {
  const { error } = await supabase.rpc("empty_pantry", {
    p_household_id: householdId,
  });
  if (error) throw error;
};
