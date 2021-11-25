import { Reducer, useCallback, useReducer, useRef } from 'react';
import { JsonapiCollection } from '../types';
import { useDatx } from './useDatx';

export type rollbackFn = () => void;

export interface Options<TInput, TData, TError> {
  /**
   * A function to be executed before the mutation runs.
   *
   * It receives the same input as the mutate function.
   *
   * It can be an async or sync function, in both cases if it returns a function
   * it will keep it as a way to rollback the changed applied inside onMutate.
   */
  onMutate?(params: { input: TInput }): Promise<rollbackFn | void> | rollbackFn | void;
  /**
   * A function to be executed after the mutation resolves successfully.
   *
   * It receives the result of the mutation.
   *
   * If a Promise is returned, it will be awaited before proceeding.
   */
  onSuccess?(params: { data: TData; input: TInput }): Promise<void> | void;
  /**
   * A function to be executed after the mutation failed to execute.
   *
   * If a Promise is returned, it will be awaited before proceeding.
   */
  onFailure?(params: {
    error: TError;
    rollback: rollbackFn | void;
    input: TInput;
  }): Promise<void> | void;
  /**
   * A function to be executed after the mutation has resolves, either
   * successfully or as failure.
   *
   * This function receives the error or the result of the mutation.
   * It follow the normal Node.js callback style.
   *
   * If a Promise is returned, it will be awaited before proceeding.
   */
  onSettled?(
    params:
      | { status: 'success'; data: TData; input: TInput }
      | {
          status: 'failure';
          error: TError;
          rollback: rollbackFn | void;
          input: TInput;
        },
  ): Promise<void> | void;
  /**
   * If defined as `true`, a failure in the mutation will cause the `mutate`
   * function to throw. Disabled by default.
   */
  throwOnFailure?: boolean;
  /**
   * If defined as `true`, a failure in the mutation will cause the Hook to
   * throw in render time, making error boundaries catch the error.
   */
  useErrorBoundary?: boolean;
}

export type Status = 'idle' | 'running' | 'success' | 'failure';

function noop() {}

/**
 * Get the latest value received as parameter, useful to be able to dynamically
 * read a value from params inside a callback or effect without cleaning and
 * running again the effect or recreating the callback.
 */
function useGetLatest<Value>(value: Value): () => Value {
  const ref = useRef<Value>(value);
  ref.current = value;
  return useCallback(() => ref.current, []);
}

const initialState: State<never, never> = { status: 'idle' };

const reducer = <TData, TError>(_, action): State<TData, TError> => {
  if (action.type === 'RESET') {
    return { status: 'idle' };
  }
  if (action.type === 'MUTATE') {
    return { status: 'running' };
  }
  if (action.type === 'SUCCESS') {
    return { status: 'success', data: action.data };
  }
  if (action.type === 'FAILURE') {
    return { status: 'failure', error: action.error };
  }

  throw Error('Invalid action');
}

export type Reset = () => void;

export type MutationResult<TInput, TData, TError> = [
  (input: TInput) => Promise<TData | undefined>,
  { status: Status; data?: TData; error?: TError; reset: Reset },
];

type State<TData, TError> = { status: Status; data?: TData; error?: TError };

type Action<TData, TError> =
  | { type: 'RESET' }
  | { type: 'MUTATE' }
  | { type: 'SUCCESS'; data: TData }
  | { type: 'FAILURE'; error: TError };

export type MutationFn<TInput, TData> = (store: JsonapiCollection, input: TInput, ) => Promise<TData> | TData;

export function useMutation<TInput = any, TData = any, TError = unknown>(
  mutationFn: MutationFn<TInput, TData>,
  {
    onMutate = () => noop,
    onSuccess = noop,
    onFailure = noop,
    onSettled = noop,
    throwOnFailure = false,
    useErrorBoundary = false,
  }: Options<TInput, TData, TError> = {},
): MutationResult<TInput, TData, TError> {
  const store = useDatx();

  const [{ status, data, error }, dispatch] = useReducer<Reducer<State<TData, TError>, Action<TData, TError>>>(
    reducer,
    initialState,
  );

  const getMutationFn = useGetLatest(mutationFn);
  const latestMutation = useRef(0);

  /**
   * Run your mutation function, this function receives an input value and pass
   * it directly to your mutation function.
   */
  const mutate = useCallback(async function mutate(
    input: TInput,
    config: Omit<Options<TInput, TData, TError>, 'onMutate' | 'useErrorBoundary'> = {},
  ) {
    const mutation = Date.now();
    latestMutation.current = mutation;

    dispatch({ type: 'MUTATE' });
    const rollback = (await onMutate({ input })) ?? noop;

    try {
      const data = await getMutationFn()(store, input);

      if (latestMutation.current === mutation) {
        dispatch({ type: 'SUCCESS', data });
      }

      await onSuccess({ data, input });
      await (config.onSuccess ?? noop)({ data, input });

      await onSettled({ status: 'success', data, input });
      await (config.onSettled ?? noop)({ status: 'success', data, input });

      return data;
    } catch (err) {
      const error = err as TError;

      await onFailure({ error, rollback, input });
      await (config.onFailure ?? noop)({ error, rollback, input });

      await onSettled({ status: 'failure', error, input, rollback });
      await (config.onSettled ?? noop)({
        status: 'failure',
        error,
        input,
        rollback,
      });

      if (latestMutation.current === mutation) {
        dispatch({ type: 'FAILURE', error });
      }

      if (config.throwOnFailure ?? throwOnFailure) throw error;

      return;
    }
  },
  []);

  const reset = useCallback(function reset() {
    dispatch({ type: 'RESET' });
  }, []);

  if (useErrorBoundary && error) throw error;

  return [mutate, { status, data, error, reset }];
}
