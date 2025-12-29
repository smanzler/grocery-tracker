import { Tables, TablesUpdate } from "@/lib/database.types";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import {
  addHouseholdUser,
  createHousehold,
  removeHouseholdUser,
  updateHousehold,
} from "./client";

export const useCreateHousehold = () => {
  return useMutation({
    mutationFn: ({ name, image_url }: { name: string; image_url?: string }) =>
      createHousehold(name, image_url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
};

export const useUpdateHousehold = () => {
  return useMutation({
    mutationFn: (household: TablesUpdate<"households">) => updateHousehold(household),
    onSuccess: (household: Tables<"households">) => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({
        queryKey: ["household", household.id],
      });
    },
  });
};

export const useAddHouseholdUser = () => {
  return useMutation({
    mutationFn: ({householdId, email}: {householdId: string, email: string}) => addHouseholdUser(householdId, email),
    onSuccess: (householdId: string) => {
      queryClient.invalidateQueries({
        queryKey: ["household-users", householdId],
      });
    },
  });
};

export const useRemoveHouseholdUser = () => {
  return useMutation({
    mutationFn: (householdRoleId: string) =>
      removeHouseholdUser(householdRoleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["household-users"] });
    },
  });
};