import { useMutation, UseMutationResult, MutationFunction } from "@tanstack/react-query";

export const useMutationHooks = <TVariables = void, TData = void>(
    fnCallback: MutationFunction<TData, TVariables>
): UseMutationResult<TData, Error, TVariables> => {
    return useMutation<TData, Error, TVariables>({
        mutationFn: fnCallback,
    });
};