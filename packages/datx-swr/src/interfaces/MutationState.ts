import { IJsonapiModel, Response } from '@datx/jsonapi';
import { IResponseData } from './IResponseData';
import { MutationStatus } from './MutationStatus';

export interface IMutationState<TModel extends IJsonapiModel, TData extends IResponseData> {
  status: MutationStatus;
  data?: Response<TModel, TData>;
  error?: Response<TModel, TData>;
}
