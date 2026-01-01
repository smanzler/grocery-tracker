import { useQuery } from "@tanstack/react-query";
import { getHouseholdInfoFromInviteToken, getHouseholdInvites } from "./client";

export const useHouseholdInvites = (householdId?: string) => {
  return useQuery({
    queryKey: ["household-invites", householdId],
    queryFn: () => getHouseholdInvites(householdId!),
    enabled: !!householdId,
  });
};

export const useHouseholdInfoFromInviteToken = (inviteToken?: string) => {
  return useQuery({
    queryKey: ["household-info-from-invite", inviteToken],
    queryFn: () => getHouseholdInfoFromInviteToken(inviteToken!),
    enabled: !!inviteToken,
  });
};
