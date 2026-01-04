import { supabase } from "@/lib/supabase";

export const getSignedImageUrl = async (
  bucket: string,
  path: string,
  expiresIn?: number
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn ?? 60);
  if (error) {
    throw error;
  }
  return data.signedUrl;
};
