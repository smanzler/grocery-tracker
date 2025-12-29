import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import {
  createHouseholdInvite,
  redeemHouseholdInvite,
  removeHouseholdInvite,
} from "./client";

export const useCreateHouseholdInvite = () => {
  return useMutation({
    mutationFn: (householdId: string) => createHouseholdInvite(householdId),
    onSuccess: ({
      householdId,
      inviteLink,
    }: {
      householdId: string;
      inviteLink: string;
    }) => {
      queryClient.invalidateQueries({
        queryKey: ["household-invites", householdId],
      });
      return { inviteLink };
    },
  });
};

export const useRemoveHouseholdInvite = (householdId: string) => {
  return useMutation({
    mutationFn: (inviteId: string) => removeHouseholdInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["household-invites", householdId],
      });
    },
  });
};

export const useRedeemHouseholdInvite = () => {
  return useMutation({
    mutationFn: ({
      inviteToken,
      userId,
    }: {
      inviteToken: string;
      userId: string;
    }) => redeemHouseholdInvite(inviteToken, userId),
  });
};
