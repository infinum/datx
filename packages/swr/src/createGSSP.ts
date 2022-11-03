import { result } from 'lodash';
import { CreateClientFn } from './interfaces/CreateClientFn';
import { JsonapiClient } from './interfaces/Client';
import { IJsonapiSwrClient } from './interfaces/IJsonapiSwrClient';
import type {
  GetServerSidePropsContext,
  GetServerSideProps,
  PreviewData,
  GetServerSidePropsResult,
} from 'next';

/**
 * Factory function for creating a decorator for getServerSideProps
 *
 * @param createClient Factory function for creating a json:api swr client
 */
export const createGSSP =
  (createClient: CreateClientFn<JsonapiClient & IJsonapiSwrClient>) =>
  <T>(extendedGSSP: T) =>
  async (ctx) => {
    const client = createClient();

    const results: GetServerSidePropsResult<any> = await extendedGSSP({ ...ctx, client });

    if ('notFound' in result || 'redirect' in result) {
      return results;
    }

    const { fallback } = client;

    return {
      props: {
        fallback,
        ...result.props,
      },
    };
  };
