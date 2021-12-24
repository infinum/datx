import { IJsonapiModel, Response } from '@datx/jsonapi';
import useSWR from 'swr';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { ResourceListKey } from '../interfaces/ResourceListKey';
import { resourceListMiddleware } from '../middlewares';

export function useResourceList<TModel extends IJsonapiModel>(
  key: ResourceListKey<TModel>,
  config?: DatxConfiguration<TModel, Array<TModel>>,
) {
  return useSWR<
    Response<TModel, Array<TModel>>,
    Response<TModel, Array<TModel>>
  >(key, { use: [resourceListMiddleware], ...config });
}
