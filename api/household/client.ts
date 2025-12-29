import { TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getHouseholds = async () => {
  const { data, error } = await supabase.from("households").select("*");
  if (error) throw error;
  return data;
};

export const getHousehold = async (householdId?: string) => {
  if (!householdId) return null;
  const { data, error } = await supabase.from("households").select("*").eq("id", householdId).single();
  if (error) throw error;
  return data;
};

export const createHousehold = async (name: string, image_url?: string) => {
  const { data, error } = await supabase.rpc("create_household", {
    p_name: name,
    p_image_url: image_url,
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

export const getHouseholdUsers = async (householdId: string) => {
  const { data, error } = await supabase
    .from("household_users")
    .select("id, user_id, created_at")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const addHouseholdUser = async (
  householdId: string,
  email: string
) => {
  const { error } = await supabase.rpc("add_household_user", {
    p_household_id: householdId,
    p_email: email,
  });
  if (error) throw error;
  return householdId;
};

export const removeHouseholdUser = async (householdRoleId: string) => {
  const { error } = await supabase
    .from("household_users")
    .delete()
    .eq("id", householdRoleId);
  if (error) throw error;
};