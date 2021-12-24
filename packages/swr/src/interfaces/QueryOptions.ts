import { IJsonapiModel, IResponseData } from "@datx/jsonapi";
import { QuerySelectFn } from "./QuerySelectFn";

export type QueryOptions<TModel extends IJsonapiModel, TData extends IResponseData, TVariables> = {
  select?: QuerySelectFn<TModel, TData>;
  variables?: TVariables;
};
