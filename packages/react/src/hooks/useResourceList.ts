import { getModelType } from '@datx/core';
import { IJsonapiModel, prepareQuery, Response } from '@datx/jsonapi';
import isFunction from 'lodash/isFunction';
import useSWR  from 'swr';

import { useDatx } from './useDatx';

import { Meta, QueryConfig, QueryResources, _QueryResourceFn, _QueryResourcesFn } from '../types';
import { pickRequestOptions } from '../utils';

export function useResourceList<TModel extends IJsonapiModel, TMeta extends Meta = Meta>(
  queryResources: QueryResources<TModel>,
  config?: QueryConfig<TModel>
) {
  const store = useDatx();

  const getKey = () => {
    const [type, options] = isFunction(queryResources) ? queryResources() : queryResources;
    const modelType = getModelType(type);

    const query = prepareQuery(modelType, undefined, undefined, options);

    return query.url;
  };

  const fetcher = async (url: string) => {
    // TODO: this is suboptimal because we are doing the same thing in getKey
    const [_, options] = isFunction(queryResources) ? queryResources() : queryResources;

    const requestOptions = pickRequestOptions(options);

    const response = await store.request<TModel>(url, 'GET', undefined, requestOptions);

    if (config?.sideload) {
      return await config.sideload(response);
    }

    return response;
  };

  return useSWR<Response<TModel>, Response<TModel>>(getKey, fetcher, config);
}
