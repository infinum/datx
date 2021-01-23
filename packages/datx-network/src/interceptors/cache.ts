import { getModelType, IType, PureModel, PureCollection } from '@datx/core';
import { mapItems } from '@datx/utils';

import { Response } from '../Response';
import { IResponseSnapshot } from '../interfaces/IResponseSnapshot';
import { CachingStrategy } from '../enums/CachingStrategy';
import { IFetchOptions } from '../interfaces/IFetchOptions';
import { HttpMethod } from '../enums/HttpMethod';
import { INetworkHandler } from '../interfaces/INetworkHandler';

export interface ICache {
  response: Response<PureModel>;
  time: number;
  types: Array<IType>;
  url: string;
}

export interface ICacheInternal {
  response: IResponseSnapshot;
  collection?: PureCollection;
  time: number;
  types: Array<IType>;
  url: string;
}

let cacheStorage: Array<ICacheInternal> = [];

export function saveCache(url: string, response: Response<PureModel>): void {
  if (response && response.isSuccess && (response.data || response.data === null)) {
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

export function getCache(url: string, maxAge: number): ICache | undefined {
  const ageLimit = Date.now() - maxAge * 1000;
  const cache = cacheStorage.find((item) => item.url === url && item.time > ageLimit);

  if (cache) {
    const data = cache.response;

    return {
      // @ts-ignore Array headers that are supported but shouldn't be exposed in types
      response: new Response(data.response, cache.collection, data.options),
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
  collection?: PureCollection,
): Array<Omit<ICacheInternal, 'collection'>> {
  return cacheStorage
    .filter((item) => item.collection === collection)
    .map((item) => Object.assign({}, item, { collection: undefined }));
}

export function saveCacheForCollection(
  cacheItems: Array<Omit<ICacheInternal, 'collection'>>,
  collection?: PureCollection,
): void {
  cacheStorage.push(
    ...cacheStorage,
    ...cacheItems.map((item) => Object.assign({ collection }, item)),
  );
}

function makeNetworkCall<T extends PureModel>(
  params: IFetchOptions,
  next: INetworkHandler,
  doCacheResponse = false,
  existingResponse?: Response<T>,
): Promise<Response<T>> {
  return next(params).then(
    (response: Response<T>) => {
      let finalResponse = response;
      if (existingResponse) {
        finalResponse = existingResponse.update(response, params.views);
      }
      if (doCacheResponse) {
        saveCache(params.url, finalResponse);
      }
      return finalResponse;
    },
    (response: Response<T>) => {
      throw response;
    },
  );
}

function getLocalNetworkError<T extends PureModel>(
  message: string,
  reqOptions: IFetchOptions,
  collection?: PureCollection,
): Response<T> {
  return new Response<T>(
    {
      error: new Error(message),
      collection,
      requestHeaders: reqOptions.options?.networkConfig?.headers,
    },
    collection,
  );
}

export function cacheInterceptor<T extends PureModel>(
  cache: CachingStrategy,
  maxCacheAge = Infinity,
) {
  return (request: IFetchOptions, next?: INetworkHandler): Promise<Response<T>> => {
    if (!next) {
      throw new Error("Cache interceptor can't be the last interceptor");
    }

    const isCacheSupported = request.method.toUpperCase() === HttpMethod.Get;

    const cacheStrategy =
      request.options?.cacheOptions?.skipCache || !isCacheSupported
        ? CachingStrategy.NetworkOnly
        : request.options?.cacheOptions?.cachingStrategy || cache;

    // NetworkOnly - Ignore cache
    if (cacheStrategy === CachingStrategy.NetworkOnly) {
      return makeNetworkCall<T>(request, next);
    }

    const cacheContent: { response: Response<T> } | undefined = (getCache(
      request.url,
      maxCacheAge,
    ) as unknown) as { response: Response<T> } | undefined;

    // NetworkFirst - Fallback to cache only on network error
    if (cacheStrategy === CachingStrategy.NetworkFirst) {
      return makeNetworkCall<T>(request, next, true).catch((errorResponse) => {
        if (cacheContent) {
          return cacheContent.response;
        }
        throw errorResponse;
      });
    }

    // StaleWhileRevalidate - Use cache and update it in background
    if (cacheStrategy === CachingStrategy.StaleWhileRevalidate) {
      const network = makeNetworkCall<T>(request, next, true);

      if (cacheContent) {
        network.catch(() => {
          // Ignore the failure
        });
        return Promise.resolve(cacheContent.response);
      }

      return network;
    }

    // CacheOnly - Fail if nothing in cache
    if (cacheStrategy === CachingStrategy.CacheOnly) {
      if (cacheContent) {
        return Promise.resolve(cacheContent.response);
      }

      return Promise.reject(
        getLocalNetworkError('No cache for this request', request, request?.collection),
      );
    }

    // CacheFirst - Use cache if available
    if (cacheStrategy === CachingStrategy.CacheFirst) {
      return cacheContent
        ? Promise.resolve(cacheContent.response)
        : makeNetworkCall<T>(request, next, true);
    }

    // StaleAndUpdate - Use cache and update response once network is complete
    if (cacheStrategy === CachingStrategy.StaleAndUpdate) {
      const existingResponse = cacheContent?.response?.clone();

      const network = makeNetworkCall<T>(request, next, true, existingResponse);

      if (existingResponse) {
        network.catch(() => {
          // Ignore the failure
        });
        return Promise.resolve(existingResponse);
      }

      return network;
    }

    return Promise.reject(
      getLocalNetworkError('Invalid caching strategy', request, request?.collection),
    );
  };
}
