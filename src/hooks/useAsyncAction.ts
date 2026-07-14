import { useCallback, useState } from "react";

export interface AsyncActionState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
) {
  const [state, setState] = useState<AsyncActionState<TResult>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await action(...args);
        setState({ loading: false, error: null, data });
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ loading: false, error, data: null });
        throw error;
      }
    },
    [action],
  );

  return { ...state, execute };
}