import { IRequestOptions } from '@datx/jsonapi';
import { Middleware, SWRHook, useSWRConfig } from 'swr';

export const middleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const { compare: defaultCompare } = useSWRConfig();
  const {
    networkConfig,
    compare: configCompare,
    ...swrConfig
  } = (config as typeof config & { networkConfig: IRequestOptions['networkConfig'] }) || {};

  const compare = (a, b) => {
    const comp = configCompare || defaultCompare;
    const aRawResponseData = a?.__internal?.response?.data || a;
    const bRawResponseData = b?.__internal?.response?.data || b;

    return comp(aRawResponseData, bRawResponseData);
  };

  return useSWRNext(key, fetcher && ((expression) => fetcher(expression, { networkConfig })), {
    compare,
    ...swrConfig,
  });
};
