import { useQuery } from "@tanstack/react-query";
import {
  getHousehold,
  getHouseholdUsers,
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

export const useHouseholdUsers = (householdId?: string) => {
  return useQuery({
    queryKey: ["household-users", householdId],
    queryFn: () => getHouseholdUsers(householdId!),
    enabled: !!householdId,
  });
};