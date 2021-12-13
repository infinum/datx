import { getModelType } from '@datx/core';
import { prepareQuery, Response, IJsonapiModel } from '@datx/jsonapi';
import isFunction from 'lodash/isFunction';
import useSWR from 'swr';

import { useDatx } from './useDatx';

import { pickRequestOptions } from '../utils';
import { QueryResource } from '..';

export function useResource<TModel extends IJsonapiModel>(
  queryResource: QueryResource<TModel>,
  config?: QueryConfig<TModel>
) {
  const store = useDatx();

  const getKey = () => {
    const [type, id, options] = isFunction(queryResource) ? queryResource() : queryResource;
    const modelType = getModelType(type);

    const query = prepareQuery(modelType, id, undefined, options);

    return query.url;
  };

  const fetcher = async (url: string) => {
    // TODO: this is suboptimal because we are doing the same thing in getKey
    const [_, __, options] = isFunction(queryResource) ? queryResource() : queryResource;

    const requestOptions = pickRequestOptions(options);

    const response = await store.request<TModel>(url, 'GET', undefined, requestOptions);

    if (config?.sideload) {
      return await config.sideload(response);
    }

    return response;
  };

  return useSWR<Response<TModel>, Response<TModel>>(getKey, fetcher, config);
}
