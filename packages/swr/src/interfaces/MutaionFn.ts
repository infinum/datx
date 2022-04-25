import { IJsonapiModel, IResponseData, Response } from '@datx/jsonapi';
import { ClientInstance } from './Client';

export type MutationFn<
  TInput,
  TModel extends IJsonapiModel = IJsonapiModel,
  TData extends IResponseData = IResponseData<TModel>,
> = (
  client: ClientInstance,
  input: TInput,
) => Promise<Response<TModel, TData>> | Response<TModel, TData>;
