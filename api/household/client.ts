import { TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getHouseholds = async () => {
  const { data, error } = await supabase.from("households").select("*");
  if (error) throw error;
  return data;
};

export const getHousehold = async (householdId?: string) => {
  if (!householdId) return null;
  const { data, error } = await supabase
    .from("households")
    .select("*")
    .eq("id", householdId)
    .single();
  if (error) throw error;
  return data;
};

export const createHousehold = async (name: string) => {
  const { data, error } = await supabase.rpc("create_household", {
    p_name: name,
  });
  if (error) throw error;
  return data;
};

export const updateHousehold = async (
  household: TablesUpdate<"households">
) => {
  if (!household.id) throw new Error("Household ID is required");
  const { data, error } = await supabase
    .from("households")
    .update(household)
    .eq("id", household.id)
    .select()
    .single();
  console.log(data, error);
  if (error) throw error;
  return data;
};
