import { useQuery } from "@tanstack/react-query";
import { getHouseholdUsers } from "./client";

export const useHouseholdUsers = (householdId?: string) => {
  return useQuery({
    queryKey: ["household-users", householdId],
    queryFn: () => getHouseholdUsers(householdId!),
    enabled: !!householdId,
  });
};
