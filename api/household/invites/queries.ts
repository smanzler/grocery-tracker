import { useQuery } from "@tanstack/react-query";
import { getHouseholdInvites } from "./client";

export const useHouseholdInvites = (householdId?: string) => {
  return useQuery({
    queryKey: ["household-invites", householdId],
    queryFn: () => getHouseholdInvites(householdId!),
    enabled: !!householdId,
  });
};