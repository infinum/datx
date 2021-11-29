import { IJsonapiModel } from '@datx/jsonapi';
import useSWR from 'swr';

import { QueryFn, QueryConfig } from '../types';
import { useDatx } from '../hooks/useDatx';

export function useQuery<TModel extends IJsonapiModel, TVariables>(
  query: QueryFn<TModel, TVariables>,
  config: QueryConfig<TModel, TVariables> = {},
) {
  const client = useDatx();
  const { variables, ...swrConfig } = config;
  const { key, fetcher } = query(client, variables);

  return useSWR(key, fetcher, swrConfig);
}
