import { queryClient } from "@/lib/query-client";
import { useMutation } from "@tanstack/react-query";
import { createHousehold } from "./client";

export const useCreateHousehold = () => {
  return useMutation({
    mutationFn: ({ name, image_url }: { name: string; image_url?: string }) => createHousehold(name, image_url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["households"] });
    },
  });
};