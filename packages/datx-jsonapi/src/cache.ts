import { getModelType, IType } from '@datx/core';
import { mapItems } from '@datx/utils';

import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Response } from './Response';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';

export interface ICache {
  response: Response<IJsonapiModel>;
  time: number;
  types: Array<IType>;
  url: string;
}

export interface ICacheInternal {
  response: IResponseSnapshot;
  collection?: IJsonapiCollection;
  time: number;
  types: Array<IType>;
  url: string;
}

let cacheStorage: Array<ICacheInternal> = [];

export function saveCache(url: string, response: Response<IJsonapiModel>): void {
  if (response?.isSuccess && response.status !== -1 && (response.data || response.data === null)) {
    const types = mapItems(response.data || [], getModelType) as IType | Array<IType>;

    cacheStorage = cacheStorage.filter((item) => item.url !== url);

    cacheStorage.unshift({
      response: response.snapshot,
      collection: response.collection,
      time: Date.now(),
      types: ([] as Array<IType>).concat(types),
      url,
    });
  }
}

export function getCache(
  url: string,
  maxAge: number,
  ResponseConstructor: typeof Response = Response,
): ICache | undefined {
  const ageLimit = Date.now() - maxAge * 1000;
  const cache = cacheStorage.find((item) => item.url === url && item.time > ageLimit);

  if (cache) {
    const data = cache.response;

    return {
      // @ts-ignore Array headers that are supported but shouldn't be exposed in types
      response: new ResponseConstructor(data.response, cache.collection, data.options),
      time: cache.time,
      types: cache.types,
      url: cache.url,
    };
  }

  return undefined;
}

export function clearAllCache(): void {
  cacheStorage.length = 0;
}

export function clearCacheByType(type: IType): void {
  cacheStorage = cacheStorage.filter((item) => !item.types.includes(type));
}

export function getCacheByCollection(
  collection: IJsonapiCollection,
): Array<Omit<ICacheInternal, 'collection'>> {
  return cacheStorage
    .filter((item) => item.collection === collection)
    .map((item) => Object.assign({}, item, { collection: undefined }));
}

export function saveCacheForCollection(
  cacheItems: Array<Omit<ICacheInternal, 'collection'>>,
  collection: IJsonapiCollection,
): void {
  // eslint-disable-next-line prefer-spread
  cacheStorage.push.apply(
    cacheStorage,
    cacheItems.map((item) => Object.assign({ collection }, item)),
  );
}
