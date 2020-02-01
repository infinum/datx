import { getModelType, IType } from 'datx';
import { mapItems } from 'datx-utils';

import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Response } from './Response';

export interface ICache {
  response: Response<IJsonapiModel>;
  time: Date;
  types: Array<IType>;
  url: string;
}

let cacheStorage: Array<ICache> = [];

export function saveCache(url: string, response: Response<IJsonapiModel>) {
  if (response && response.isSuccess && response.data) {
    const types = mapItems(response.data, getModelType) as IType | Array<IType>;

    cacheStorage.push({
      response,
      time: new Date(),
      types: ([] as Array<IType>).concat(types),
      url,
    });
  }
}

export function getCache(url: string): ICache | undefined {
  return cacheStorage.find((item) => item.url === url);
}

export function clearAllCache() {
  cacheStorage.length = 0;
}

export function clearCacheByType(type: IType) {
  cacheStorage = cacheStorage.filter((item) => !item.types.includes(type));
}
