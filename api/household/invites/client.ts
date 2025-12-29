import { supabase } from "@/lib/supabase";

export const getHouseholdInvites = async (householdId: string) => {
  const { data, error } = await supabase
    .from("household_invites")
    .select("id, email, created_at")
    .eq("household_id", householdId);
  if (error) throw error;
  return data;
};

export const createHouseholdInvite = async (householdId: string) => {
  const { data, error } = await supabase.rpc("create_household_invite", {
    p_household_id: householdId,
  });
  if (error) throw error;
  return { householdId, inviteLink: data };
};

export const removeHouseholdInvite = async (inviteId: string) => {
  const { error } = await supabase.from("household_invites").delete().eq("id", inviteId);
  if (error) throw error;
};

export const redeemHouseholdInvite = async (inviteToken: string, userId: string) => {
  const { error } = await supabase.rpc("redeem_household_invite", {
    p_invite_token: inviteToken,
    p_user_id: userId,
  });
  if (error) throw error;
};