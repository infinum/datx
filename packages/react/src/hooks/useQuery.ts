import { IJsonapiModel, IResponseData } from '@datx/jsonapi';
import useSWR from 'swr';

import { useDatx } from '../hooks/useDatx';
import { QueryConfiguration } from '../interfaces/QueryConfiguration';
import { QueryFn } from '../interfaces/QueryFn';

export function useQuery<TModel extends IJsonapiModel, TData extends IResponseData, TVariables>(
  query: QueryFn<TModel, TData, TVariables>,
  config: QueryConfiguration<TModel, TData, TVariables> = {},
) {
  const client = useDatx();
  const { variables, ...swrConfig } = config;
  const { key, fetcher } = query(client, variables);

  return useSWR(key, fetcher, swrConfig);
}
