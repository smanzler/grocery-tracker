import { TablesUpdate } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getProfile = async (userId?: string) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

export const updateProfile = async (profile: TablesUpdate<"profiles">) => {
  if (!profile.id) throw new Error("Profile ID is required");
  const { data, error } = await supabase
    .from("profiles")
    .update(profile)
    .eq("id", profile.id)
    .select()
    .single();
  if (error) throw error;
  return data;
};
