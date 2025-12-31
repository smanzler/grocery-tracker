import { useQuery } from "@tanstack/react-query";
import { getPantryItems } from "./client";

export const usePantryItems = (householdId?: string) => {
  return useQuery({
    queryKey: ["pantry-items", householdId],
    queryFn: () => getPantryItems(householdId!),
    enabled: !!householdId,
  });
};
