import { supabase } from "@/lib/supabase";

export const getHouseholds = async () => {
  const { data, error } = await supabase.from("households").select("*");
  if (error) throw error;
  return data;
};