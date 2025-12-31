import { supabase } from "@/lib/supabase";

export const getPantryItems = async (householdId: string) => {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*, profiles(display_name)")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};
