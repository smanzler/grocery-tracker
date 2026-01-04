import { useQuery } from "@tanstack/react-query";
import { getSignedImageUrl } from "./client";

export const useSignedImageUrl = (
  bucket: string,
  path?: string,
  expiresIn?: number
) => {
  return useQuery({
    queryKey: ["signed-image-url", path, expiresIn],
    queryFn: () => getSignedImageUrl(bucket, path!, expiresIn),
    enabled: !!path,
    staleTime: expiresIn ? expiresIn * 1000 : 60 * 1000,
  });
};
