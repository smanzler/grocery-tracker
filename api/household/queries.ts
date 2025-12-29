import { useQuery } from "@tanstack/react-query";
import {
  getHousehold,
  getHouseholds,
} from "./client";

export const useHouseholds = () => {
  return useQuery({
    queryKey: ["households"],
    queryFn: getHouseholds,
  });
};

export const useHousehold = (householdId?: string) => {
  return useQuery({
    queryKey: ["household", householdId],
    queryFn: () => getHousehold(householdId),
    enabled: !!householdId,
  });
};
