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
  const queryKey = ["list-items", householdId];

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
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<Tables<"list_items">[]>(queryKey);

      const itemExists = previousData?.some(
        (item) => item.grocery_item_id === variables.groceryItemId
      );

      if (itemExists) {
        queryClient.setQueryData<Tables<"list_items">[]>(queryKey, (old) => {
          if (!old) return old;
          return old.map((item) => {
            if (item.grocery_item_id === variables.groceryItemId) {
              return {
                ...item,
                total_quantity: item.total_quantity + variables.quantity,
              };
            }
            return item;
          });
        });
      }

      return { previousData, itemExists };
    },
    onSuccess: (_data, _variables, context) => {
      if (!context?.itemExists) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
    onError: optimisticRollback<Tables<"list_items">[]>(queryKey),
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
  const queryKey = ["list-items", householdId];

  return useMutation({
    mutationFn: () => checkoutListItems(householdId),
    onMutate: optimisticUpdate<Tables<"list_items">[], void>({
      queryKey,
      updater: (old) => old.filter((item) => !item.checked),
    }),
    onError: optimisticRollback<Tables<"list_items">[]>(queryKey),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
      queryClient.invalidateQueries({
        queryKey: ["pantry-batches"],
      });
    },
  });
};

export const useRemoveListItem = (householdId: string) => {
  const queryKey = ["list-items", householdId];

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
    onMutate: optimisticUpdate<
      Tables<"list_items">[],
      { householdId: string; groceryItemId: string; quantity: number }
    >({
      queryKey,
      updater: (old, variables) =>
        old
          .map((item) =>
            item.grocery_item_id === variables.groceryItemId
              ? {
                  ...item,
                  total_quantity: item.total_quantity - variables.quantity,
                }
              : item
          )
          .filter((item) => item.total_quantity > 0),
    }),
    onError: optimisticRollback<Tables<"list_items">[]>(queryKey),
  });
};
