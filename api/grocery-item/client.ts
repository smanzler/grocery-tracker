import { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { UseGroceryItemsProps } from "./queries";

export const getGroceryItems = async (filters?: UseGroceryItemsProps) => {
  const { search, limit } = filters ?? {};
  const query = supabase.from("grocery_items").select("*");

  if (search) {
    query.ilike("name", `%${search}%`);
  }

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getGroceryItem = async (id: string) => {
  const { data, error } = await supabase
    .from("grocery_items")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
};

export const createGroceryItem = async (
  groceryItem: TablesInsert<"grocery_items">
) => {
  const { data, error } = await supabase
    .from("grocery_items")
    .insert(groceryItem)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGroceryItem = async (
  groceryItem: TablesUpdate<"grocery_items">
) => {
  if (!groceryItem.id) throw new Error("Grocery item ID is required");
  const { data, error } = await supabase
    .from("grocery_items")
    .update(groceryItem)
    .eq("id", groceryItem.id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const deleteGroceryItem = async (id: string) => {
  const { error } = await supabase.from("grocery_items").delete().eq("id", id);
  if (error) throw error;
};

export const mergeGroceryItems = async (sourceId: string, targetId: string) => {
  const { data, error } = await supabase.rpc("merge_grocery_items", {
    p_source_id: sourceId,
    p_target_id: targetId,
  });
  if (error) throw error;
  return data;
};
