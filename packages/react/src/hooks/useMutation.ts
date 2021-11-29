import { IJsonapiModel } from '@datx/jsonapi';
import { Reducer, useCallback, useReducer, useRef } from 'react';
import { IMutationOptions, MutationAction, MutationFn, MutationResult } from '..';
import { MutationState } from '../types';
import { useDatx } from './useDatx';

// eslint-disable-next-line @typescript-eslint/no-empty-function
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

const initialState: MutationState<never, never> = { status: 'idle' };

const reducer = <TData, TError>(_, action): MutationState<TData, TError> => {
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
};

export function useMutation<TInput = any, TData extends IJsonapiModel = any, TError = unknown>(
  mutationFn: MutationFn<TData, TInput>,
  {
    onMutate = () => noop,
    onSuccess = noop,
    onFailure = noop,
    onSettled = noop,
    throwOnFailure = false,
    useErrorBoundary = false,
  }: IMutationOptions<TInput, TData, TError> = {},
): MutationResult<TInput, TData, TError> {
  const client = useDatx();

  const [{ status, data, error }, dispatch] = useReducer<
    Reducer<MutationState<TData, TError>, MutationAction<TData, TError>>
  >(reducer, initialState);

  const getMutationFn = useGetLatest(mutationFn);
  const latestMutation = useRef(0);

  /**
   * Run your mutation function, this function receives an input value and pass
   * it directly to your mutation function.
   */
  const mutate = useCallback(async function mutate(
    input: TInput,
    config: Omit<IMutationOptions<TInput, TData, TError>, 'onMutate' | 'useErrorBoundary'> = {},
  ) {
    const mutation = Date.now();
    latestMutation.current = mutation;

    dispatch({ type: 'MUTATE' });
    const rollback = (await onMutate({ input })) ?? noop;

    try {
      const data = await getMutationFn()(client, input);

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
