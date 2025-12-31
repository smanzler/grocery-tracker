import { useMutation } from "@tanstack/react-query";
import { removePantryItem } from "./client";

export const useRemovePantryItem = () => {
  return useMutation({
    mutationFn: (itemId: string) => removePantryItem(itemId),
  });
};
