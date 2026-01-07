import { TablesInsert } from "@/lib/database.types";
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
