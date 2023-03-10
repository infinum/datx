import { View, commitModel } from '@datx/core';
import { setMeta, mobx, IResponseHeaders } from '@datx/utils';

import {
  MODEL_PERSISTED_FIELD,
  MODEL_PROP_FIELD,
  MODEL_QUEUE_FIELD,
  MODEL_RELATED_FIELD,
} from './consts';
import { isBrowser } from './helpers/utils';
import { ICollectionFetchOpts } from './interfaces/ICollectionFetchOpts';
import { IHeaders } from './interfaces/IHeaders';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IRawResponse } from './interfaces/IRawResponse';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { ILink, IResponse } from './interfaces/JsonApi';
import { Response as LibResponse } from './Response';
import { CachingStrategy, ParamArrayType } from '@datx/network';
import { saveCache, getCache } from './cache';

export type FetchType = (
  method: string,
  url: string,
  body?: object,
  requestHeaders?: IHeaders,
  fetchOptions?: object,
) => Promise<IRawResponse>;

export type CollectionFetchType = <T extends IJsonapiModel>(
  options: ICollectionFetchOpts,
) => Promise<LibResponse<T>>;

export interface IResponseObject {
  data: IResponse;
  error?: Error;
  headers: IResponseHeaders;
  requestHeaders: IHeaders;
  status: number;
}

export interface IConfigType {
  baseFetch: FetchType;
  baseUrl: string;
  cache: CachingStrategy;
  maxCacheAge: number;
  defaultFetchOptions: Record<string, any>;
  fetchReference?: typeof fetch;
  paramArrayType: ParamArrayType;
  encodeQueryString?: boolean;
  onError(IResponseObject): IResponseObject;
  transformRequest(options: ICollectionFetchOpts): ICollectionFetchOpts;
  transformResponse(response: IRawResponse): IRawResponse;
  usePatchWhenPossible: boolean;

  /**
   * Enable stable sort of url search params using `URLSearchParams.sort()` method.
   * It will also sort include params using `Array.sort()` method.
   * @default false
   */
  sortParams?: boolean;
}

export const config: IConfigType = {
  // Base URL for all API calls
  baseUrl: '/',

  // Enable caching by default in the browser
  cache: isBrowser ? CachingStrategy.CacheFirst : CachingStrategy.NetworkOnly,
  maxCacheAge: Infinity,

  // Default options that will be passed to the fetch function
  defaultFetchOptions: {
    headers: {
      'content-type': 'application/vnd.api+json',
    },
  },

  encodeQueryString: false,
  sortParams: false,

  // Reference of the fetch method that should be used
  fetchReference:
    (isBrowser &&
      'fetch' in window &&
      typeof window.fetch === 'function' &&
      window.fetch.bind(window)) ||
    globalThis?.fetch,

  // Determines how will the request param arrays be stringified
  paramArrayType: ParamArrayType.CommaSeparated, // As recommended by the spec

  /**
   * Base implementation of the fetch function (can be overridden)
   *
   * @param {string} method API call method
   * @param {string} url API call URL
   * @param {object} [body] API call body
   * @param {IHeaders} [requestHeaders] Headers that will be sent
   * @param {object} [fetchOptions] Options that can be passed from the fetch function call
   * @returns {Promise<IRawResponse>} Resolves with a raw response object
   */
  baseFetch(
    method: string,
    url: string,
    body?: object,
    requestHeaders?: IHeaders,
    _fetchOptions?: object,
  ): Promise<IRawResponse> {
    let data: IResponse;
    let status: number;
    let headers: IResponseHeaders;

    const request: Promise<void> = Promise.resolve();

    const uppercaseMethod = method.toUpperCase();
    const isBodySupported = uppercaseMethod !== 'GET' && uppercaseMethod !== 'HEAD';

    return request
      .then(() => {
        const defaultHeaders = config.defaultFetchOptions.headers || {};
        const reqHeaders: IHeaders = Object.assign({}, defaultHeaders, requestHeaders) as IHeaders;
        const options = Object.assign({}, config.defaultFetchOptions, {
          body: (isBodySupported && JSON.stringify(body)) || undefined,
          headers: reqHeaders,
          method,
        });

        if (this.fetchReference) {
          return this.fetchReference(url, options);
        }
        throw new Error('Fetch reference needs to be defined before using the network');
      })
      .then((response: Response) => {
        status = response.status;
        headers = response.headers;

        return response.json();
      })
      .catch((error: Error) => {
        if (status === 204) {
          return null;
        }
        throw error;
      })
      .then((responseData: IResponse) => {
        data = responseData;
        if (status >= 400) {
          throw {
            message: `Invalid HTTP status: ${status}`,
            status,
          };
        }

        return { data, headers, requestHeaders, status };
      })
      .catch((error) => {
        return this.onError({ data, error, headers, requestHeaders, status });
      });
  },

  onError(resp: IResponseObject) {
    return resp;
  },

  transformRequest(options: ICollectionFetchOpts): ICollectionFetchOpts {
    return options;
  },

  transformResponse(response: IRawResponse): IRawResponse {
    return response;
  },

  usePatchWhenPossible: true,
};

function getLocalNetworkError<T extends IJsonapiModel>(
  message: string,
  reqOptions: ICollectionFetchOpts,
  collection?: IJsonapiCollection,
): LibResponse<T> {
  const ResponseConstructor: typeof LibResponse =
    reqOptions.options?.fetchOptions?.['Response'] || LibResponse;
  return new ResponseConstructor<T>(
    {
      error: new Error(message),
      // collection,
      requestHeaders: reqOptions.options?.networkConfig?.headers,
    },
    collection,
    reqOptions.options,
  );
}

function makeNetworkCall<T extends IJsonapiModel>(
  params: ICollectionFetchOpts,
  fetchOptions?: object,
  doCacheResponse = false,
  existingResponse?: LibResponse<T>,
): Promise<LibResponse<T>> {
  const ResponseConstructor: typeof LibResponse = fetchOptions?.['Response'] || LibResponse;
  return config
    .baseFetch(
      params.method,
      params.url,
      params.data,
      params?.options?.networkConfig?.headers,
      fetchOptions,
    )
    .then((response: IRawResponse) => {
      const collectionResponse = Object.assign({}, response, { collection: params.collection });
      const payload = config.transformResponse(collectionResponse);

      if (existingResponse) {
        existingResponse.update(payload, params.views);
        return existingResponse;
      }

      return new ResponseConstructor<T>(
        payload,
        params.collection,
        params.options,
        undefined,
        params.views,
      );
    })
    .then((response: LibResponse<T>) => {
      if (doCacheResponse) {
        saveCache(params.url, response);
      }
      return response;
    });
}

/**
 * Base implementation of the stateful fetch function (can be overridden)
 *
 * @param {ICollectionFetchOpts} reqOptions API request options
 * @returns {Promise<Response>} Resolves with a response object
 */
function collectionFetch<T extends IJsonapiModel>(
  reqOptions: ICollectionFetchOpts,
): Promise<LibResponse<T>> {
  const ResponseConstructor: typeof LibResponse =
    reqOptions.options?.fetchOptions?.['Response'] || LibResponse;

  const params = config.transformRequest(reqOptions);
  // const { url, options, data, method = 'GET', collection, views } = params;

  const staticCollection = params?.collection?.constructor as unknown as {
    maxCacheAge?: number;
    cache: CachingStrategy;
  };
  const collectionCache = staticCollection && staticCollection.cache;
  const isCacheSupported = params.method.toUpperCase() === 'GET';

  const cacheStrategy =
    reqOptions.options?.cacheOptions?.skipCache || !isCacheSupported
      ? CachingStrategy.NetworkOnly
      : reqOptions.options?.cacheOptions?.cachingStrategy || collectionCache || config.cache;

  let maxCacheAge: number = config.maxCacheAge || Infinity;

  if (staticCollection && staticCollection.maxCacheAge !== undefined) {
    maxCacheAge = staticCollection.maxCacheAge;
  }
  if (reqOptions.options?.cacheOptions?.maxAge !== undefined) {
    maxCacheAge = reqOptions.options?.cacheOptions?.maxAge;
  }

  // NetworkOnly - Ignore cache
  if (cacheStrategy === CachingStrategy.NetworkOnly) {
    return makeNetworkCall<T>(params, reqOptions.options?.fetchOptions);
  }

  const cacheContent: { response: LibResponse<T> } | undefined = getCache(
    params.url,
    maxCacheAge,
    ResponseConstructor,
  ) as unknown as { response: LibResponse<T> } | undefined;

  // NetworkFirst - Fallback to cache only on network error
  if (cacheStrategy === CachingStrategy.NetworkFirst) {
    return makeNetworkCall<T>(params, reqOptions.options?.fetchOptions, true).catch(
      (errorResponse) => {
        if (cacheContent) {
          return cacheContent.response;
        }
        throw errorResponse;
      },
    );
  }

  // StaleWhileRevalidate - Use cache and update it in background
  if (cacheStrategy === CachingStrategy.StaleWhileRevalidate) {
    const network = makeNetworkCall<T>(params, reqOptions.options?.fetchOptions, true);

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
      getLocalNetworkError('No cache for this request', reqOptions, params?.collection),
    );
  }

  // PREFER_CACHE - Use cache if available
  if (cacheStrategy === CachingStrategy.CacheFirst) {
    return cacheContent
      ? Promise.resolve(cacheContent.response)
      : makeNetworkCall<T>(params, reqOptions.options?.fetchOptions, true);
  }

  // StaleAndUpdate - Use cache and update response once network is complete
  if (cacheStrategy === CachingStrategy.StaleAndUpdate) {
    const existingResponse = cacheContent?.response?.clone() as LibResponse<T>;

    const network = makeNetworkCall<T>(
      params,
      reqOptions.options?.fetchOptions,
      true,
      existingResponse,
    );

    if (existingResponse) {
      network.catch(() => {
        // Ignore the failure
      });
      return Promise.resolve(existingResponse);
    }

    return network;
  }

  return Promise.reject(
    getLocalNetworkError('Invalid caching strategy', reqOptions, params?.collection),
  );
}

export function libFetch<T extends IJsonapiModel = IJsonapiModel>(
  options: ICollectionFetchOpts,
): Promise<LibResponse<T>> {
  return collectionFetch<T>(options);
}

/**
 * API call used to get data from the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {IRequestOptions} [options] Server options
 * @param {Array<View>} [views] Request view
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function read<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  collection?: IJsonapiCollection,
  options?: IRequestOptions,
  views?: Array<View>,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data: undefined,
    method: 'GET',
    options,
    url,
    views,
  });
}

/**
 * API call used to create data on the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IRequestOptions} [options] Server options
 * @param {Array<View>} [views] Request view
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function create<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  data?: object,
  collection?: IJsonapiCollection,
  options?: IRequestOptions,
  views?: Array<View>,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data,
    method: 'POST',
    options,
    url,
    views,
  });
}

/**
 * API call used to update data on the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IRequestOptions} [options] Server options
 * @param {Array<View>} [views] Request view
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function update<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  data?: object,
  collection?: IJsonapiCollection,
  options?: IRequestOptions,
  views?: Array<View>,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data,
    method: 'PATCH',
    options,
    url,
    views,
  });
}

/**
 * API call used to update data on the server with put
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IRequestOptions} [options] Server options
 * @param {Array<View>} [views] Request view
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function put<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  data?: object,
  collection?: IJsonapiCollection,
  options?: IRequestOptions,
  views?: Array<View>,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data,
    method: 'PUT',
    options,
    url,
    views,
  });
}

/**
 * API call used to remove data from the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {IRequestOptions} [options] Server options
 * @param {Array<View>} [views] Request view
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function remove<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  collection?: IJsonapiCollection,
  options?: IRequestOptions,
  views?: Array<View>,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data: undefined,
    method: 'DELETE',
    options,
    url,
    views,
  });
}

/**
 * Fetch a link from the server
 *
 * @export
 * @param {JsonApi.ILink} link Link URL or a link object
 * @param {IJsonapiCollection} collection Store that will be used to save the response
 * @param {IRequestOptions} [options] Server options
 * @param {Array<View>} [views] Request view
 * @returns {Promise<LibResponse>} Response promise
 */
export function fetchLink<T extends IJsonapiModel = IJsonapiModel>(
  link: ILink,
  collection?: IJsonapiCollection,
  options?: IRequestOptions,
  views?: Array<View>,
  ResponseConstructor: typeof LibResponse = LibResponse,
): Promise<LibResponse<T>> {
  if (link) {
    const href: string = typeof link === 'object' ? link.href : link;

    if (href) {
      return read<T>(href, collection, options, views);
    }
  }

  return Promise.resolve(new ResponseConstructor({ data: undefined }, collection));
}

export function handleResponse<T extends IJsonapiModel = IJsonapiModel>(
  record: T,
  prop?: string,
): (response: LibResponse<T>) => T {
  return mobx.action((response: LibResponse<T>): T => {
    if (response.error) {
      throw response.error;
    }

    if (response.status === 204) {
      setMeta(record, MODEL_PERSISTED_FIELD, true);

      return record;
    }

    if (response.status === 202) {
      const responseRecord = response.data as T;

      setMeta(responseRecord, MODEL_PROP_FIELD, prop);
      setMeta(responseRecord, MODEL_QUEUE_FIELD, true);
      setMeta(responseRecord, MODEL_RELATED_FIELD, record);

      return responseRecord;
    }
    setMeta(record, MODEL_PERSISTED_FIELD, true);

    const data = response.replaceData(record).data as T;

    commitModel(data);

    return data;
  });
}
