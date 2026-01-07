import { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import {
  createGroceryItem,
  deleteGroceryItem,
  mergeGroceryItems,
  updateGroceryItem,
} from "./client";

export const useCreateGroceryItem = () => {
  return useMutation({
    mutationFn: (groceryItem: TablesInsert<"grocery_items">) =>
      createGroceryItem(groceryItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-items"] });
    },
  });
};

export const useUpdateGroceryItem = () => {
  return useMutation({
    mutationFn: (groceryItem: TablesUpdate<"grocery_items">) =>
      updateGroceryItem(groceryItem),
    onSuccess: (data) => {
      if (!data?.id) return;
      queryClient.invalidateQueries({ queryKey: ["grocery-item", data.id] });
      queryClient.invalidateQueries({ queryKey: ["grocery-items"] });
    },
  });
};

export const useDeleteGroceryItem = () => {
  return useMutation({
    mutationFn: (id: string) => deleteGroceryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-items"] });
    },
  });
};

export const useMergeGroceryItems = () => {
  return useMutation({
    mutationFn: ({
      sourceId,
      targetId,
    }: {
      sourceId: string;
      targetId: string;
    }) => mergeGroceryItems(sourceId, targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["grocery-items"],
      });
      queryClient.invalidateQueries({ queryKey: ["list-items"] });
      queryClient.invalidateQueries({
        queryKey: ["pantry-items"],
      });
    },
  });
};
