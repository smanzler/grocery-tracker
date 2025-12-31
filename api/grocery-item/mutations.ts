import { TablesInsert } from "@/lib/database.types";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { createGroceryItem } from "./client";

export const useCreateGroceryItem = () => {
  return useMutation({
    mutationFn: (groceryItem: TablesInsert<"grocery_items">) =>
      createGroceryItem(groceryItem),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery-items"] });
    },
  });
};
