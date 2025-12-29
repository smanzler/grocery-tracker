import { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { createListItem, updateListItem } from "./client";

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
  return useMutation({
    mutationFn: (listItem: TablesUpdate<"list_items">) =>
      updateListItem(listItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-items", householdId] });
    },
  });
};
