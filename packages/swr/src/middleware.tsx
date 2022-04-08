import { Middleware, SWRHook } from 'swr';

// @ts-ignore
export const middleware: Middleware = (useSWRNext: SWRHook) => (key, fetcher, config) => {
  const { networkConfig, ...swrConfig } = (config as any) || {};

  return useSWRNext(key, (expression) => fetcher?.(expression, { networkConfig }), swrConfig);
};
