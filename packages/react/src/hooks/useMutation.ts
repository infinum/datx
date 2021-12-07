import { IJsonapiModel, IResponseData, Response } from '@datx/jsonapi';
import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { IMutationOptions, MutationState, MutationAction, MutationFn, MutationResult } from '../types';
import { useDatx } from './useDatx';

function useGetLatest<Value>(value: Value): () => Value {
  const ref = useRef<Value>(value);

  useEffect(() => {
    ref.current = value;
  });

  return useCallback(() => ref.current, []);
}

const initialState: MutationState<never, never> = { status: 'idle' };

const reducer = <TModel extends IJsonapiModel, TData extends IResponseData>(_, action): MutationState<TModel, TData> => {
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

export function useMutation<TInput, TModel extends IJsonapiModel = IJsonapiModel, TData extends IResponseData = IResponseData<TModel>>(
  mutationFn: MutationFn<TInput, TModel, TData>,
  {
    onMutate,
    onSuccess,
    onFailure,
    onSettled,
    throwOnFailure = false,
    useErrorBoundary = false,
  }: IMutationOptions<TInput, TModel, TData> = {},
): MutationResult<TInput, TModel, TData> {
  const client = useDatx();

  const [{ status, data, error }, dispatch] = useReducer<
    Reducer<MutationState<TModel, TData>, MutationAction<TModel, TData>>
  >(reducer, initialState);

  const getMutationFn = useGetLatest(mutationFn);
  const latestMutation = useRef(0);

  const mutate = useCallback(async function mutate(
    input: TInput,
    config: Omit<IMutationOptions<TInput, TModel, TData>, 'onMutate' | 'useErrorBoundary'> = {},
  ) {
    const mutation = Date.now();
    latestMutation.current = mutation;

    dispatch({ type: 'MUTATE' });
    const rollback = await onMutate?.({ input });

    try {
      const data = await getMutationFn()(client, input);

      if (latestMutation.current === mutation) {
        dispatch({ type: 'SUCCESS', data });
      }

      await onSuccess?.({ data, input });
      await config.onSuccess?.({ data, input });

      await onSettled?.({ status: 'success', data, input });
      await config.onSettled?.({ status: 'success', data, input });

      return data;
    } catch (err) {
      const error = err as Response<TModel, TData>;

      await onFailure?.({ error, rollback, input });
      await config.onFailure?.({ error, rollback, input });

      await onSettled?.({ status: 'failure', error, input, rollback });
      await config.onSettled?.({
        status: 'failure',
        error,
        input,
        rollback,
      });

      if (latestMutation.current === mutation) {
        dispatch({ type: 'FAILURE', error });
      }

      if (config.throwOnFailure ?? throwOnFailure) {
        throw error;
      }

      return;
    }
  },
  []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  if (useErrorBoundary && error) {
    throw error;
  }

  return [mutate, { status, data, error, reset }];
}