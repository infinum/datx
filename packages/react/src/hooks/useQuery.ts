import { IResponseData } from '@datx/jsonapi';
import useSWR from 'swr';

import { QueryFn, QueryConfig } from '../types';
import { useDatx } from '../hooks/useDatx';

export function useQuery<TData extends IResponseData, TVariables>(
  query: QueryFn<TData, TVariables>,
  config: QueryConfig<TData, TVariables> = {},
) {
  const client = useDatx();
  const { variables, ...swrConfig } = config;
  const { key, fetcher } = query(client, variables);

  return useSWR(key, fetcher, swrConfig);
}
