import { result } from 'lodash';
import { CreateClientFn } from './interfaces/CreateClientFn';
import { JsonapiClient } from './interfaces/Client';
import { IJsonapiSwrClient } from './interfaces/IJsonapiSwrClient';

/**
 * Decorator for getServerSideProps
 *
 * @param createClient Factory function for creating a json:api swr client
 */
export const createGSSP =
  (createClient: CreateClientFn<JsonapiClient & IJsonapiSwrClient>) =>
  (gsp: (...args: Array<any>) => Promise<any>) =>
  async (ctx) => {
    const client = createClient();

    const results = await gsp({ ...ctx, fetchQuery: client.fetchQuery });

    if ('notFound' in result || 'redirect' in result) {
      return results;
    }

    const { fallback } = client;

    return {
      props: {
        fallback,
        ...result['props'],
      },
    };
  };
