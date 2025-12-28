import { useQuery } from "@tanstack/react-query";
import { getList } from "./client";

export const useList = (id: string) => {
  return useQuery({
    queryKey: ["list", id],
    queryFn: () => getList(id),
    enabled: !!id,
  });
};
