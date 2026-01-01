import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { emptyPantry, removePantryItem } from "./client";

export const useRemovePantryItem = (householdId: string) => {
  return useMutation({
    mutationFn: (itemId: string) => removePantryItem(itemId),
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
