import {getModelType, IType} from 'datx';
import {IDictionary} from 'datx-utils';

import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {Response} from './Response';

export interface ICache {
  response: Response<IJsonapiModel>;
  time: Date;
  type: IType;
  url: string;
}

let cacheStorage: Array<ICache> = [];

export function saveCache(url: string, response: Response<IJsonapiModel>, modelType?: string) {
  if (response && 'data' in response && (!('error' in response) || !response.error) && response.data) {
    // The type might need to be 100% correct - used only to clear the cache
    const type = modelType || getModelType(response.data instanceof Array ? response.data[0] : response.data);
    cacheStorage.push({response, time: new Date(), type, url});
  }
}

export function getCache(url: string): ICache|undefined {
  return cacheStorage.find((item) => item.url === url);
}

export function clearAllCache() {
  cacheStorage.length = 0;
}

export function clearCacheByType(type: IType) {
  cacheStorage = cacheStorage.filter((item) => item.type !== type);
}
