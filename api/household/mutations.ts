import { Tables, TablesUpdate } from "@/lib/database.types";
import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { createHousehold, updateHousehold } from "./client";

export const useCreateHousehold = () => {
  return useMutation({
    mutationFn: ({ name }: { name: string }) => createHousehold(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
};

export const useUpdateHousehold = () => {
  return useMutation({
    mutationFn: (household: TablesUpdate<"households">) =>
      updateHousehold(household),
    onSuccess: (household: Tables<"households">) => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
      queryClient.invalidateQueries({
        queryKey: ["household", household.id],
      });
    },
  });
};
