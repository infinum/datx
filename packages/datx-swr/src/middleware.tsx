import { IRequestOptions } from '@datx/jsonapi';
import { Middleware, SWRHook, useSWRConfig } from 'swr';
import { getResponseCompare } from './compare';

export const middleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const { compare: defaultCompare } = useSWRConfig();
  const {
    networkConfig,
    compare: configCompare,
    ...swrConfig
  } = (config as typeof config & { networkConfig: IRequestOptions['networkConfig'] }) || {};

  return useSWRNext(key, fetcher && ((expression) => fetcher(expression, { networkConfig })), {
    compare: getResponseCompare(configCompare || defaultCompare),
    ...swrConfig,
  });
};
