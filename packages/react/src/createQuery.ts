import memoizeOne from 'memoize-one';
import { IJsonapiModel, IResponseData } from "@datx/jsonapi";
import { QueryFn } from "./types";

export function createQuery<TModel extends IJsonapiModel, TData extends IResponseData, TVariables>(queryFn: QueryFn<TModel, TData, TVariables>) {
  // TODO - implement isDeepEqual
  return memoizeOne(queryFn);
}
