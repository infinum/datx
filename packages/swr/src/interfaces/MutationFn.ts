import { IJsonapiModel, Response } from '@datx/jsonapi';
import { IClientInstance } from './Client';
import { IResponseData } from './IResponseData';

export type MutationFn<
  TInput,
  TModel extends IJsonapiModel = IJsonapiModel,
  TData extends IResponseData = IResponseData<TModel>,
> = (
  client: IClientInstance,
  input: TInput,
) => Promise<Response<TModel, TData>> | Response<TModel, TData>;
