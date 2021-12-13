import { IJsonapiModel, IResponseData, Response } from "@datx/jsonapi";
import { Fetcher, SWRConfiguration } from "swr";
import { QueryOptions } from "./QueryOptions";

export type QueryConfiguration<TModel extends IJsonapiModel, TData extends IResponseData, TVariables> = SWRConfiguration<
  Response<TModel, TData>,
  Response<TModel, TData>,
  Fetcher<Response<TModel, TData>>
> &
  QueryOptions<TModel, TData, TVariables>;
