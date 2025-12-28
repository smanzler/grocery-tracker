import { useMutation } from "@tanstack/react-query";
import { createList } from "./client";

export const useCreateList = () => {
  return useMutation({
    mutationFn: createList,
  });
};