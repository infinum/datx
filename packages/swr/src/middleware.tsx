import { Middleware, SWRHook } from 'swr';

export const middleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const { networkConfig, ...swrConfig } = (config as any) || {};

  return useSWRNext(
    key,
    fetcher && ((expression) => fetcher(expression, { networkConfig })),
    swrConfig,
  );
};
