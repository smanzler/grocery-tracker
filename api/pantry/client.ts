import { supabase } from "@/lib/supabase";

export const getPantryItems = async (householdId: string) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const consumePantryItem = async (
  householdId: string,
  itemId: string,
  quantity: number
) => {
  const { error } = await supabase.rpc("consume_pantry_item", {
    p_household_id: householdId,
    p_grocery_item_id: itemId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return itemId;
};

export const emptyPantry = async (householdId: string) => {
  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("household_id", householdId);
  if (error) throw error;
};

export const addPantryItem = async (
  householdId: string,
  items: { grocery_item_id: string; quantity: number }[]
) => {
  const { data, error } = await supabase.rpc("add_pantry_batches", {
    p_household_id: householdId,
    p_items: items,
  });
  if (error) throw error;
  return data;
};
