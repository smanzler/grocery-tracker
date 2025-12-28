import { useQuery } from "@tanstack/react-query";
import { getList, getLists } from "./client";

export const useLists = () => {
  return useQuery({
    queryKey: ["lists"],
    queryFn: getLists,
  });
};

export const useList = (id: string) => {
  return useQuery({
    queryKey: ["list", id],
    queryFn: () => getList(id),
    enabled: !!id,
  });
};
