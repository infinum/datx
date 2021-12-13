import { IJsonapiModel, IResponseData, Response } from "@datx/jsonapi";
import { Client } from "./Client";

export type MutationFn<TInput, TModel extends IJsonapiModel = IJsonapiModel, TData extends IResponseData = IResponseData<TModel>> = (
  client: Client,
  input: TInput,
) => Promise<Response<TModel, TData>> | Response<TModel, TData>;
