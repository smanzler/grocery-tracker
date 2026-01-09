import { useQuery } from "@tanstack/react-query";
import { getPantryBatches } from "./client";

export interface PantryBatchesFilters {
  householdId: string | null;
  itemId?: string;
  active?: boolean;
}

export const usePantryBatches = (filters: PantryBatchesFilters) => {
  return useQuery({
    queryKey: ["pantry-batches", filters],
    queryFn: () => getPantryBatches(filters),
    enabled: !!filters.householdId,
  });
};
