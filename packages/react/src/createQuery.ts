import memoizeOne from 'memoize-one';
import { IResponseData } from "@datx/jsonapi";
import { QueryFn } from "./types";

export function createQuery<TData extends IResponseData, TVariables>(queryFn: QueryFn<TData, TVariables>) {
  // TODO - implement isDeepEqual
  return memoizeOne(queryFn);
}
