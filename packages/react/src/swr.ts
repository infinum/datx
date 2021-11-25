import useSWR, { SWRConfiguration, Key } from 'swr';

export function useSWRCache<Data = any, Error = any>(key: Key, config?: SWRConfiguration<Data, Error>) {
  return useSWR(key, null, config);
}
