import { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getListItems = async (householdId?: string) => {
  if (!householdId) throw new Error("Household ID is required");
  const { data, error } = await supabase
    .from("list_items")
    .select("*")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const createListItem = async (listItem: TablesInsert<"list_items">) => {
  const { data, error } = await supabase.from("list_items").insert(listItem);
  if (error) throw error;
  return data;
};

export const updateListItem = async (listItem: TablesUpdate<"list_items">) => {
  if (!listItem.id) throw new Error("List item ID is required");
  const { data, error } = await supabase
    .from("list_items")
    .update(listItem)
    .eq("id", listItem.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
