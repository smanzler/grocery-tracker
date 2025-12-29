import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { removeHouseholdUser } from "./client";

export const useRemoveHouseholdUser = () => {
  return useMutation({
    mutationFn: (householdRoleId: string) => removeHouseholdUser(householdRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-users"] });
    },
  });
};