import { supabase } from "@/lib/supabase";

export const getListItems = async (householdId?: string) => {
  if (!householdId) throw new Error("Household ID is required");
  const { data, error } = await supabase
    .from("list_items")
    .select("*, grocery_items(*)")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const addListItem = async (
  householdId: string,
  groceryItemId: string,
  quantity: number
) => {
  const { data, error } = await supabase.rpc("add_list_item", {
    p_household_id: householdId,
    p_grocery_item_id: groceryItemId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return data;
};

export const checkoutListItems = async (householdId: string) => {
  const { data, error } = await supabase.rpc("checkout_list_items", {
    p_household_id: householdId,
  });
  if (error) throw error;
  return data;
};

export const removeListItem = async (
  householdId: string,
  groceryItemId: string,
  quantity: number
) => {
  const { error } = await supabase.rpc("remove_list_item", {
    p_household_id: householdId,
    p_grocery_item_id: groceryItemId,
    p_quantity: quantity,
  });
  if (error) throw error;
};

export const toggleListItemChecked = async (
  householdId: string,
  groceryItemId: string
) => {
  const { error } = await supabase.rpc("toggle_list_item_checked", {
    p_household_id: householdId,
    p_grocery_item_id: groceryItemId,
  });
  if (error) throw error;
};
