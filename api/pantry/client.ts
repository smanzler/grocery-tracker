import { supabase } from "@/lib/supabase";

export const getPantryItems = async (householdId: string) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*, grocery_items(*), profiles(display_name)")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const consumePantryItem = async (itemId: string, quantity: number) => {
  const { data, error } = await supabase.rpc("consume_pantry_item", {
    p_item_id: itemId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return data;
};

export const emptyPantry = async (householdId: string) => {
  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("household_id", householdId);
  if (error) throw error;
};

export const addPantryItem = async (
  itemId: string,
  quantity: number,
  expiresAt?: string
) => {
  const { data, error } = await supabase.rpc("add_pantry_item", {
    p_item_id: itemId,
    p_quantity: quantity,
    p_expires_at: expiresAt,
  });
  if (error) throw error;
  return data;
};
