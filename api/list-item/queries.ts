import { useQuery } from "@tanstack/react-query";
import { getListItems } from "./client";

export const useListItems = (householdId?: string) => {
  return useQuery({
    queryKey: ["list-items", householdId],
    queryFn: () => getListItems(householdId),
    enabled: !!householdId,
  });
};
