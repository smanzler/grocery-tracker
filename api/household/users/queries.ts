import { useQuery } from "@tanstack/react-query";
import { getHouseholdUsers, isHouseholdMember } from "./client";

export const useHouseholdUsers = (householdId?: string) => {
  return useQuery({
    queryKey: ["household-users", householdId],
    queryFn: () => getHouseholdUsers(householdId!),
    enabled: !!householdId,
  });
};

export const useIsHouseholdMember = (householdId?: string) => {
  return useQuery({
    queryKey: ["is-household-member", householdId],
    queryFn: () => isHouseholdMember(householdId!),
    enabled: !!householdId,
  });
};
