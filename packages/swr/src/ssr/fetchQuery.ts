import { IJsonapiModel, IRequestOptions, Response } from '@datx/jsonapi';
import { createFetcher, QueryExpression } from '..';
import { Client } from '../interfaces/Client';
import { isFunction, undefinedToNull } from '../utils';

export async function fetchQuery<
  TModel extends IJsonapiModel
>(
  client: Client,
  queryExpression: QueryExpression<TModel>,
  config?: Pick<IRequestOptions, 'networkConfig'>
) {
  try {
    const expression = isFunction(queryExpression) ? queryExpression() : queryExpression;

    if (!expression) {
      throw Error('Expression is missing some dependencies!');
    }

    const response = await createFetcher(client)(expression, config);

    // TODO figure how to create key the same way as SWR
    return { [url]: undefinedToNull(response.snapshot) };
  } catch (error) {
    if (error instanceof Response) {
      throw error.error;
    }

    throw error;
  }
}
