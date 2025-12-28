import { supabase } from "@/lib/supabase";

export const getHouseholds = async () => {
  const { data, error } = await supabase.from("households").select("*");
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