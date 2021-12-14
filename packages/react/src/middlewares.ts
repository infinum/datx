import { getModelType } from '@datx/core';
import { prepareQuery } from '@datx/jsonapi';
import { SWRHook } from 'swr';
import { useDatx } from './hooks/useDatx';
import { DatxConfiguration } from './interfaces/DatxConfiguration';
import { ResourceKey } from './interfaces/ResourceKey';
import { ResourceListKey } from './interfaces/ResourceListKey';
import { isFunction } from './utils';

export const resourceListMiddleware =
  (useSWRNext: SWRHook) =>
  (key: ResourceListKey<any>, _fetcher: null, config: DatxConfiguration<any, any>) => {
    const client = useDatx();

    const getKey = () => {
      const args = isFunction(key) ? key() : key;

      const [type, queryParams] = args;
      const modelType = getModelType(type);

      const query = prepareQuery(modelType, undefined, undefined, { queryParams });

      return query.url;
    };

    const fetcher = (url: string) => {
      const { networkConfig } = config;

      return client.request(url, 'GET', undefined, { networkConfig });
    };

    const swr = useSWRNext(getKey, fetcher, config);

    return swr;
  };

export const resourceMiddleware =
  (useSWRNext: SWRHook) =>
  (key: ResourceKey<any>, _fetcher: null, config: DatxConfiguration<any, any>) => {
    const client = useDatx();

    const getKey = () => {
      const args = isFunction(key) ? key() : key;

      const [type, id, queryParams] = args;
      const modelType = getModelType(type);
      const query = prepareQuery(modelType, id, undefined, { queryParams });

      return query.url;
    };

    const fetcher = (url: string) => {
      const { networkConfig } = config;

      return client.request(url, 'GET', undefined, { networkConfig });
    };

    const swr = useSWRNext(getKey, fetcher, config);

    return swr;
  };
