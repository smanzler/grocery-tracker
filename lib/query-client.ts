import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

type OptimisticUpdateOptions<TData, TVariables> = {
  queryKey: unknown[];
  updater: (old: TData, variables: TVariables) => TData;
};

export function optimisticUpdate<TData, TVariables>({
  queryKey,
  updater,
}: OptimisticUpdateOptions<TData, TVariables>) {
  return async (variables: TVariables) => {
    await queryClient.cancelQueries({ queryKey });

    const previousData = queryClient.getQueryData<TData>(queryKey);

    queryClient.setQueryData<TData>(queryKey, (old) => {
      if (!old) return old;
      return updater(old, variables);
    });

    return { previousData };
  };
}

export function optimisticRollback<TData>(queryKey: unknown[]) {
  return (
    _err: unknown,
    _variables: unknown,
    context: { previousData?: TData } | undefined
  ) => {
    if (context?.previousData) {
      queryClient.setQueryData(queryKey, context.previousData);
    }
  };
}

type UpdateWithServerResponseOptions<
  TData extends Record<string, unknown>[],
  _TServerData extends Record<string, unknown>,
  TVariables
> = {
  queryKey: unknown[];
  matcher: (item: TData[number], variables: TVariables) => boolean;
};

export function updateWithServerResponse<
  TData extends Record<string, unknown>[],
  TServerData extends Record<string, unknown>,
  TVariables
>({
  queryKey,
  matcher,
}: UpdateWithServerResponseOptions<TData, TServerData, TVariables>) {
  return (serverData: TServerData, variables: TVariables) => {
    queryClient.setQueryData<TData>(queryKey, (old) => {
      if (!old) return old;
      return old.map((item) =>
        matcher(item, variables) ? { ...item, ...serverData } : item
      ) as TData;
    });
  };
}
