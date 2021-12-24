import { IJsonapiModel, IResponseData, Response } from '@datx/jsonapi';
import { Client } from '../interfaces/Client';
import { QueryFn } from '../interfaces/QueryFn';
import { getUrl, undefinedToNull } from '../utils';

export async function fetchQuery<
  TModel extends IJsonapiModel,
  TData extends IResponseData,
  TVariables,
>(
  client: Client,
  query: QueryFn<TModel, TData, TVariables>,
  variables?: TVariables,
) {
  const { key, fetcher } = query(client, variables);

  try {
    const url = getUrl(key);

    if (!url) {
      throw Error(`fetchQuery Error - Missing variables. URL can't be constructed form provided variables: ${JSON.stringify(variables)}`);
    }

    const response = await fetcher(url);

    return { [url]: undefinedToNull(response.snapshot) };
  } catch (error) {
    if (error instanceof Response) {
      throw error.error;
    }

    throw error;
  }
}
