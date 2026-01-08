import { useQuery } from "@tanstack/react-query";
import { getPantryEvents } from "./client";

export const usePantryEvents = (
  householdId?: string,
  groceryItemId?: string
) => {
  return useQuery({
    queryKey: ["pantry-events", householdId, groceryItemId],
    queryFn: () => getPantryEvents(householdId!, groceryItemId!),
    enabled: !!householdId && !!groceryItemId,
  });
};
