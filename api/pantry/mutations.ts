import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { addPantryItem, consumePantryItem, emptyPantry } from "./client";

export const useConsumePantryItem = (householdId: string) => {
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      consumePantryItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
    },
  });
};

export const useEmptyPantry = (householdId: string) => {
  return useMutation({
    mutationFn: () => emptyPantry(householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
    },
  });
};

export const useAddPantryItem = (householdId: string) => {
  return useMutation({
    mutationFn: ({
      itemId,
      quantity,
      expiresAt,
    }: {
      itemId: string;
      quantity: number;
      expiresAt?: string;
    }) => addPantryItem(itemId, quantity, expiresAt),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
    },
  });
};
