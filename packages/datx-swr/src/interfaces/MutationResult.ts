import { IJsonapiModel, Response } from '@datx/jsonapi';
import { IMutationOptions } from './IMutationOptions';
import { IResponseData } from './IResponseData';
import { MutationResetFn } from './MutationResetFn';
import { MutationStatus } from './MutationStatus';

export type MutationResult<TInput, TModel extends IJsonapiModel, TData extends IResponseData> = [
  (
    input: TInput,
    config?: Omit<IMutationOptions<TInput, TModel, TData>, 'onMutate' | 'useErrorBoundary'>,
  ) => Promise<Response<TModel, TData> | undefined>,
  {
    status: MutationStatus;
    data?: Response<TModel, TData>;
    error?: Response<TModel, TData>;
    reset: MutationResetFn;
  },
];
