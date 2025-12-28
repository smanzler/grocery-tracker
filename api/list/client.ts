import { TablesInsert } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export const getList = async (id: string) => {
  const { data, error } = await supabase.from("lists").select("*").eq("id", id).maybeSingle();
  console.log(data);
  console.log(error);
  if (error) throw error;
  return data;
};

export const createList = async (list: TablesInsert<"lists">) => {
  const { error } = await supabase.from("lists").insert(list);
  if (error) throw error;
};