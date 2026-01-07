import { TablesInsert } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getPantryItems = async (householdId: string) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*, grocery_items(*), profiles(display_name)")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const removePantryItem = async (itemId: string) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", itemId);
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

export const insertPantryItem = async (
  pantryItem: TablesInsert<"pantry_items">
) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .insert(pantryItem)
    .select()
    .single();
  if (error) throw error;
  return data;
};
