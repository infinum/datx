import { IJsonapiModel, IResponseData, Response } from "@datx/jsonapi";

export type MutationAction<TModel extends IJsonapiModel, TData extends IResponseData> =
  | { type: 'RESET' }
  | { type: 'MUTATE' }
  | { type: 'SUCCESS'; data: Response<TModel, TData> }
  | { type: 'FAILURE'; error: Response<TModel, TData> };
