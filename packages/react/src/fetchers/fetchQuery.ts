import { IJsonapiModel, IResponseData, Response } from '@datx/jsonapi';
import { JsonapiCollection, QueryFn } from '../types';
import { undefinedToNull } from '../utils';

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

  try {
    const response = await fetcher(key);

    return { [key]: undefinedToNull(response.snapshot) };
  } catch (error) {
    if (error instanceof Response) {
      throw error.error;
    }

    throw error;
  }
}
