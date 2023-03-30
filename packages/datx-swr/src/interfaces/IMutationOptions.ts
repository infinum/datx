import { IJsonapiModel, Response } from '@datx/jsonapi';
import { IResponseData } from './IResponseData';
import { MutationRollbackFn } from './MutationRollbackFn';

export interface IMutationOptions<
  TInput,
  TModel extends IJsonapiModel = IJsonapiModel,
  TData extends IResponseData = IResponseData<TModel>,
> {
  /**
   * A function to be executed before the mutation runs.
   *
   * It receives the same input as the mutate function.
   *
   * It can be an async or sync function, in both cases if it returns a function
   * it will keep it as a way to rollback the changed applied inside onMutate.
   */
  onMutate?(params: {
    input: TInput;
  }): Promise<MutationRollbackFn | void> | MutationRollbackFn | void;
  /**
   * A function to be executed after the mutation resolves successfully.
   *
   * It receives the result of the mutation.
   *
   * If a Promise is returned, it will be awaited before proceeding.
   */
  onSuccess?(params: { data: Response<TModel, TData>; input: TInput }): Promise<void> | void;
  /**
   * A function to be executed after the mutation failed to execute.
   *
   * If a Promise is returned, it will be awaited before proceeding.
   */
  onFailure?(params: {
    error: Response<TModel, TData>;
    rollback: MutationRollbackFn | void;
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
      | { status: 'success'; data: Response<TModel, TData>; input: TInput }
      | {
          status: 'failure';
          error: Response<TModel, TData>;
          rollback: MutationRollbackFn | void;
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
