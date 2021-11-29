import memoizeOne from 'memoize-one';
import { IJsonapiModel } from "@datx/jsonapi";
import { QueryFn } from "./types";

export function createQuery<TModel extends IJsonapiModel, TVariables>(queryFn: QueryFn<TModel, TVariables>) {
  // TODO - implement isDeepEqual
  return memoizeOne(queryFn);
}
