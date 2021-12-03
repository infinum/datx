import { IJsonapiModel, IResponseData } from '@datx/jsonapi';
import { JsonapiCollection, QueryFn } from '../types';

export async function fetchQuery<
  TModel extends IJsonapiModel,
  TData extends IResponseData,
  TVariables,
>(
  client: JsonapiCollection,
  query: QueryFn<TModel, TData, TVariables>,
  variables?: TVariables,
) {
  const { key, fetcher } = query(client, variables);

  const response = await fetcher(key);

  return { [key]: response.snapshot };
}
