import { useQuery } from "@tanstack/react-query";
import { getHouseholds } from "./client";

export const useHouseholds = () => {
  return useQuery({
    queryKey: ["households"],
    queryFn: getHouseholds,
  });
};