import { Tables } from "@/lib/database.types";
import {
  optimisticRollback,
  optimisticUpdate,
  queryClient,
} from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import {
  addListItem,
  checkoutListItems,
  removeListItem,
  toggleListItemChecked,
} from "./client";

export const useAddListItem = (householdId: string) => {
  return useMutation({
    mutationFn: ({
      householdId,
      groceryItemId,
      quantity,
    }: {
      householdId: string;
      groceryItemId: string;
      quantity: number;
    }) => addListItem(householdId, groceryItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items", householdId] });
    },
  });
};

export const useToggleListItemChecked = (householdId: string) => {
  const queryKey = ["list-items", householdId];

  return useMutation({
    mutationFn: ({
      householdId,
      groceryItemId,
    }: {
      householdId: string;
      groceryItemId: string;
    }) => toggleListItemChecked(householdId, groceryItemId),
    onMutate: optimisticUpdate<
      Tables<"list_items">[],
      { householdId: string; groceryItemId: string }
    >({
      queryKey,
      updater: (old, variables) =>
        old.map((item) => {
          if (item.grocery_item_id === variables.groceryItemId) {
            return {
              ...item,
              checked: !item.checked,
            };
          }
          return item;
        }),
    }),
    onError: optimisticRollback<Tables<"list_items">[]>(queryKey),
  });
};

export const useCheckoutListItems = (householdId: string) => {
  return useMutation({
    mutationFn: () => checkoutListItems(householdId),
    onMutate: optimisticUpdate<Tables<"list_items">[], void>({
      queryKey: ["list-items", householdId],
      updater: (old) => old.filter((item) => !item.checked),
    }),
    onError: optimisticRollback<Tables<"list_items">[]>([
      "list-items",
      householdId,
    ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items", householdId] });
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
    },
  });
};

export const useRemoveListItem = (householdId: string) => {
  return useMutation({
    mutationFn: ({
      householdId,
      groceryItemId,
      quantity,
    }: {
      householdId: string;
      groceryItemId: string;
      quantity: number;
    }) => removeListItem(householdId, groceryItemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["list-items", householdId],
      });
    },
  });
};
