import { supabase } from "@/lib/supabase";

export const getHouseholdUsers = async (householdId: string) => {
  const { data, error } = await supabase
    .from("household_users")
    .select("id, user_id, created_at")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const removeHouseholdUser = async (householdRoleId: string) => {
  const { error } = await supabase
    .from("household_users")
    .delete()
    .eq("id", householdRoleId);
  if (error) throw error;
};
