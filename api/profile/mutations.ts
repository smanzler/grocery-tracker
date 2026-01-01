import { Tables, TablesUpdate } from "@/lib/database.types";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { updateProfile } from "./client";

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (profile: TablesUpdate<"profiles">) => updateProfile(profile),
    onSuccess: (profile: Tables<"profiles">) => {
      queryClient.invalidateQueries({ queryKey: ["profile", profile.id] });
    },
  });
};
