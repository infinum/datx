import { IJsonapiModel, Response } from "@datx/jsonapi";
import useSWR, { Fetcher, Key } from "swr";
import { JsonapiCollection } from "..";

import { useDatx } from "../hooks/useDatx";
import { QueryConfig } from "../types";

export interface IQueryResult<TModel extends IJsonapiModel> {
  key: Key;
  fetcher: Fetcher<Response<TModel>>;
}

export type QueryFn<TModel extends IJsonapiModel, TVariables> = (store: JsonapiCollection, variables?: TVariables) => IQueryResult<TModel>;

export function useQuery<TModel extends IJsonapiModel, TVariables>(query: QueryFn<TModel, TVariables>, config: QueryConfig<TModel, TVariables> = {}) {
  const store = useDatx();
  const { variables, ...swrConfig } = config;
  const { key, fetcher } = query(store, variables);

  return useSWR(key, fetcher, swrConfig);
}
