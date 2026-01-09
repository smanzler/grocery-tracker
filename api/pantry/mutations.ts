import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { addPantryItem, consumePantryItem, emptyPantry } from "./client";

export const useConsumePantryItem = (householdId: string) => {
  return useMutation({
    mutationFn: ({
      householdId,
      itemId,
      quantity,
    }: {
      householdId: string;
      itemId: string;
      quantity: number;
    }) => consumePantryItem(householdId, itemId, quantity),
    onSuccess: (itemId: string) => {
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pantry-batches", { householdId, itemId }],
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
      householdId,
      items,
    }: {
      householdId: string;
      items: { grocery_item_id: string; quantity: number }[];
    }) => addPantryItem(householdId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
    },
  });
};
