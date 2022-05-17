import { result } from 'lodash';
import { CreateClientFn } from './interfaces/CreateClientFn';

export const createGSSP =
  (createClient: CreateClientFn) =>
  (gssp: (...args: Array<any>) => Promise<any>) =>
  async (ctx) => {
    const client = createClient() as any;

    const results = await gssp({ ...ctx, fetchQuery: client.fetchQuery });

    if (!result.redirect || !result.notFound) {
      const { fallback } = client;

      return {
        props: {
          fallback,
          ...result.props,
        },
      };
    } else {
      return results;
    }
  };
