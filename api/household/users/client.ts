import { supabase } from "@/lib/supabase";

export const getHouseholdUsers = async (householdId: string) => {
  const { data, error } = await supabase
    .from("household_users")
    .select("id, user_id, created_at, profiles(display_name, image_url)")
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

export const isHouseholdMember = async (householdId: string) => {
  const { data, error } = await supabase.rpc("is_household_user", {
    p_household_id: householdId,
  });
  if (error) throw error;
  return data;
};
