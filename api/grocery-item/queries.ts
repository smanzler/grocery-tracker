import { useQuery } from "@tanstack/react-query";
import { getGroceryItem, getGroceryItems } from "./client";

export interface UseGroceryItemsProps {
  search?: string;
  limit?: number;
}

export const useGroceryItems = (filters?: UseGroceryItemsProps) => {
  return useQuery({
    queryKey: ["grocery-items", filters],
    queryFn: () => getGroceryItems(filters),
    enabled: filters?.search === undefined || filters?.search?.length > 0,
  });
};

export const useGroceryItem = (id?: string) => {
  return useQuery({
    queryKey: ["grocery-item", id],
    queryFn: () => getGroceryItem(id!),
    enabled: !!id,
  });
};
