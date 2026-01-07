import { TablesInsert, TablesUpdate } from "@/lib/database.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroceryItem, updateGroceryItem } from "./client";

export const useCreateGroceryItem = () => {
  return useMutation({
    mutationFn: (groceryItem: TablesInsert<"grocery_items">) =>
      createGroceryItem(groceryItem),
  });
};

export const useUpdateGroceryItem = () => {
  const queryClient = useQueryClient();

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
