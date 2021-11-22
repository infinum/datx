import { getModelType } from '@datx/core';
import { prepareQuery, Response, IJsonapiModel } from '@datx/jsonapi';
import isFunction from 'lodash/isFunction';
import useSWR from 'swr';

import { useDatx } from './useDatx';

import { Meta, QueryConfig, QueryResource, _QueryResourceFn, _QueryResourcesFn } from '../types';
import { pickRequestOptions } from '../utils';

function useResource<TModel extends IJsonapiModel, TMeta extends Meta = Meta>(
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

  const swr = useSWR<Response<TModel>, Response<TModel>>(getKey, fetcher, config);

  // TODO: implement data select with getters

  return {
    ...swr,
    data: swr.data?.data as TModel,
    error: swr.error?.error,
    meta: swr.data?.meta as TMeta,
  };
}

export default useResource;
