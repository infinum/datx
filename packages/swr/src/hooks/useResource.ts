import { IJsonapiModel, Response } from '@datx/jsonapi';
import useSWR from 'swr';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';

import { ResourceKey } from '../interfaces/ResourceKey';
import { resourceMiddleware } from '../middlewares';

export function useResource<TModel extends IJsonapiModel>(
  key: ResourceKey<TModel>,
  config?: DatxConfiguration<TModel, Array<TModel>>,
) {
  return useSWR<Response<TModel, TModel>, Response<TModel, TModel>>(key, {
    use: [resourceMiddleware],
    ...config,
  });
}
