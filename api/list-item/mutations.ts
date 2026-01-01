import { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types";
import {
  optimisticRollback,
  optimisticUpdate,
  queryClient,
  updateWithServerResponse,
} from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { checkoutListItems, createListItem, updateListItem } from "./client";

export const useCreateListItem = (householdId: string) => {
  return useMutation({
    mutationFn: (listItem: TablesInsert<"list_items">) =>
      createListItem(listItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items", householdId] });
    },
  });
};

export const useUpdateListItem = (householdId: string) => {
  const queryKey = ["list-items", householdId];

  return useMutation({
    mutationFn: (listItem: TablesUpdate<"list_items">) =>
      updateListItem(listItem),
    onMutate: optimisticUpdate<
      Tables<"list_items">[],
      TablesUpdate<"list_items">
    >({
      queryKey,
      updater: (old, listItem) =>
        old.map((item) =>
          item.id === listItem.id ? { ...item, ...listItem } : item
        ),
    }),
    onSuccess: updateWithServerResponse<
      Tables<"list_items">[],
      Tables<"list_items">,
      TablesUpdate<"list_items">
    >({
      queryKey,
      matcher: (item, variables) => item.id === variables.id,
    }),
    onError: optimisticRollback<Tables<"list_items">[]>(queryKey),
  });
};

export const useCheckoutListItems = (householdId: string) => {
  return useMutation({
    mutationFn: () => checkoutListItems(householdId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items", householdId] });
      queryClient.invalidateQueries({
        queryKey: ["pantry-items", householdId],
      });
    },
  });
};
