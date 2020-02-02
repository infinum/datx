import { getModelType, IType } from 'datx';
import { mapItems } from 'datx-utils';

import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Response } from './Response';

export interface ICache {
  response: Response<IJsonapiModel>;
  time: number;
  types: Array<IType>;
  url: string;
}

let cacheStorage: Array<ICache> = [];

export function saveCache(url: string, response: Response<IJsonapiModel>) {
  if (response && response.isSuccess && response.data) {
    const types = mapItems(response.data, getModelType) as IType | Array<IType>;

    cacheStorage = cacheStorage.filter((item) => item.url !== url);

    cacheStorage.unshift({
      response,
      time: Date.now(),
      types: ([] as Array<IType>).concat(types),
      url,
    });
  }
}

export function getCache(url: string, maxAge: number): ICache | undefined {
  const ageLimit = Date.now() - maxAge * 1000;

  return cacheStorage.find((item) => item.url === url && item.time > ageLimit);
}

export function clearAllCache() {
  cacheStorage.length = 0;
}

export function clearCacheByType(type: IType) {
  cacheStorage = cacheStorage.filter((item) => !item.types.includes(type));
}
