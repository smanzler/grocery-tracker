import { useQuery } from "@tanstack/react-query";
import { getProfile } from "./client";

export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId),
    enabled: !!userId,
  });
};
