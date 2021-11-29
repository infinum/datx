import { IModelConstructor, IType, PureCollection } from '@datx/core';
import { IJsonapiModel, IJsonapiCollection, IRequestOptions, Response } from '@datx/jsonapi';
import { SWRConfiguration, Fetcher, Key } from 'swr';

export type JsonapiCollection = PureCollection & IJsonapiCollection;

export type _QueryResource<TData> = [
  IType | IModelConstructor<TData>,
  number | string,
  IRequestOptions?,
];
export type _QueryResourceFn<TData> = () => _QueryResource<TData>;
export type QueryResource<TData> = _QueryResource<TData> | _QueryResourceFn<TData>;

export type QueryResourceFn<TData> = (variables: object) => QueryResource<TData>;

export type _QueryResources<TData> = [IType | IModelConstructor<TData>, IRequestOptions?];
export type _QueryResourcesFn<TData> = () => _QueryResources<TData>;
export type QueryResources<TData> = _QueryResources<TData> | _QueryResourcesFn<TData>;

export type QueryResourcesFn<TData> = (variables: object) => QueryResources<TData>;

export type QuerySelectFn<TData> = (data: TData) => any;

type QueryConfiguration<TData extends IJsonapiModel, TVariables> = {
  select?: QuerySelectFn<TData>;
  sideload?: (response: Response<TData>) => Promise<Response<TData>>;
  variables?: TVariables;
};

export type QueryConfig<TData extends IJsonapiModel, TVariables> = SWRConfiguration<
  Response<TData>,
  Response<TData>,
  Fetcher<Response<TData>>
> &
  QueryConfiguration<TData, TVariables>;

export type Meta = Record<string, unknown>;

export interface IQueryResult<TData extends IJsonapiModel> {
  key: Key;
  fetcher: Fetcher<Response<TData>>;
}

export type QueryFn<TData extends IJsonapiModel, TVariables> = (
  client: JsonapiCollection,
  variables?: TVariables,
) => IQueryResult<TData>;

/**
 * Mutation
 */

export type rollbackFn = () => void;

export interface IMutationOptions<TInput, TData extends IJsonapiModel, TError> {
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
  onSuccess?(params: { data: Response<TData>; input: TInput }): Promise<void> | void;
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
      | { status: 'success'; data: Response<TData>; input: TInput }
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

export type Reset = () => void;

export type MutationResult<TInput, TData extends IJsonapiModel, TError> = [
  (input: TInput) => Promise<Response<TData> | undefined>,
  { status: Status; data?: TData; error?: TError; reset: Reset },
];

export type MutationState<TData, TError> = {
  status: Status;
  data?: TData;
  error?: TError;
};

export type MutationFn<TData extends IJsonapiModel, TInput> = (
  client: JsonapiCollection,
  input: TInput,
) => Promise<Response<TData>> | Response<TData>;

export type MutationAction<TData extends IJsonapiModel, TError> =
  | { type: 'RESET' }
  | { type: 'MUTATE' }
  | { type: 'SUCCESS'; data: Response<TData> }
  | { type: 'FAILURE'; error: TError };
