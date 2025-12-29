import { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getHouseholds = async () => {
  const { data, error } = await supabase.from("households").select("*");
  console.log(data, error);
  if (error) throw error;
  return data;
};

export const getHousehold = async (householdId?: string) => {
  if (!householdId) return null;
  const { data, error } = await supabase.from("households").select("*").eq("id", householdId).single();
  console.log(data, error);
  if (error) throw error;
  return data;
};

export const createHousehold = async (name: string, image_url?: string) => {
  const { data, error } = await supabase.rpc("create_household", {
    p_name: name,
    p_image_url: image_url,
  });
  console.log(data, error);
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

export const getHouseholdUsers = async (householdId: string) => {
  const { data, error } = await supabase
    .from("household_roles")
    .select("id, user_id, created_at")
    .eq("household_id", householdId);
  console.log(data, error);
  if (error) throw error;
  return data;
};

export const addHouseholdUser = async (
  householdUser: TablesInsert<"household_roles">
) => {
  const { data, error } = await supabase
    .from("household_roles")
    .insert(householdUser)
    .select()
    .single();
  console.log(data, error);
  if (error) throw error;
  return data;
};

export const removeHouseholdUser = async (householdRoleId: string) => {
  const { error } = await supabase
    .from("household_roles")
    .delete()
    .eq("id", householdRoleId);
  console.log(error);
  if (error) throw error;
};