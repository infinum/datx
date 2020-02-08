import { View } from 'datx';
import { setMeta } from 'datx-utils';
import { action } from 'mobx';

import { getCache, saveCache } from './cache';
import {
  MODEL_PERSISTED_FIELD,
  MODEL_PROP_FIELD,
  MODEL_QUEUE_FIELD,
  MODEL_RELATED_FIELD,
} from './consts';
import { ParamArrayType } from './enums/ParamArrayType';
import { isBrowser } from './helpers/utils';
import { ICollectionFetchOpts } from './interfaces/ICollectionFetchOpts';
import { IHeaders } from './interfaces/IHeaders';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IRawResponse } from './interfaces/IRawResponse';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IResponseHeaders } from './interfaces/IResponseHeaders';
import { ILink, IResponse } from './interfaces/JsonApi';
import { Response as LibResponse } from './Response';
import { CachingStrategy } from './enums/CachingStrategy';

export type FetchType = (
  method: string,
  url: string,
  body?: object,
  requestHeaders?: IHeaders,
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
}

export const config: IConfigType = {
  // Base URL for all API calls
  baseUrl: '/',

  // Enable caching by default in the browser
  cache: isBrowser ? CachingStrategy.CACHE_FIRST : CachingStrategy.NETWORK_ONLY,
  maxCacheAge: Infinity,

  // Default options that will be passed to the fetch function
  defaultFetchOptions: {
    headers: {
      'content-type': 'application/vnd.api+json',
    },
  },

  encodeQueryString: false,

  // Reference of the fetch method that should be used
  fetchReference:
    (isBrowser &&
      'fetch' in window &&
      typeof window.fetch === 'function' &&
      window.fetch.bind(window)) ||
    undefined,

  // Determines how will the request param arrays be stringified
  paramArrayType: ParamArrayType.COMMA_SEPARATED, // As recommended by the spec

  /**
   * Base implementation of the fetch function (can be overridden)
   *
   * @param {string} method API call method
   * @param {string} url API call URL
   * @param {object} [body] API call body
   * @param {IHeaders} [requestHeaders] Headers that will be sent
   * @returns {Promise<IRawResponse>} Resolves with a raw response object
   */
  baseFetch(
    method: string,
    url: string,
    body?: object,
    requestHeaders?: IHeaders,
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
          // eslint-disable-next-line no-throw-literal
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
};

function getLocalNetworkError<T extends IJsonapiModel>(
  message: string,
  reqOptions: ICollectionFetchOpts,
  collection?: IJsonapiCollection,
): LibResponse<T> {
  return new LibResponse<T>(
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
  doCacheResponse: boolean = false,
  existingResponse?: LibResponse<T>,
): Promise<LibResponse<T>> {
  return config
    .baseFetch(params.method, params.url, params.data, params?.options?.networkConfig?.headers)
    .then((response: IRawResponse) => {
      const collectionResponse = Object.assign({}, response, { collection: params.collection });
      const payload = config.transformResponse(collectionResponse);

      if (existingResponse) {
        existingResponse.update(payload, params.views);
        return existingResponse;
      }

      return new LibResponse<T>(
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
  const params = config.transformRequest(reqOptions);
  // const { url, options, data, method = 'GET', collection, views } = params;

  const staticCollection = params?.collection?.constructor as { cache?: boolean };
  const collectionCache = staticCollection && staticCollection.cache;
  const isCacheSupported = params.method.toUpperCase() === 'GET';

  const cacheStrategy =
    reqOptions.options?.cacheOptions?.skipCache || !isCacheSupported || collectionCache === false
      ? CachingStrategy.NETWORK_ONLY
      : reqOptions.options?.cacheOptions?.cachingStrategy || config.cache;

  const maxCacheAge = reqOptions.options?.cacheOptions?.maxAge ?? config.maxCacheAge;

  // NETWORK_ONLY - Ignore cache
  if (cacheStrategy === CachingStrategy.NETWORK_ONLY) {
    return makeNetworkCall<T>(params);
  }

  const cacheContent: { response: LibResponse<T> } | undefined = (getCache(
    params.url,
    maxCacheAge,
  ) as unknown) as { response: LibResponse<T> } | undefined;

  // NETWORK_FIRST - Fallback to cache only on network error
  if (cacheStrategy === CachingStrategy.NETWORK_FIRST) {
    return makeNetworkCall<T>(params, true).catch((errorResponse) => {
      if (cacheContent) {
        return cacheContent.response;
      }
      throw errorResponse;
    });
  }

  // STALE_WHILE_REVALIDATE - Use cache and update it in background
  if (cacheStrategy === CachingStrategy.STALE_WHILE_REVALIDATE) {
    const network = makeNetworkCall<T>(params, true);

    if (cacheContent) {
      network.catch(() => {
        // Ignore the failure
      });
      return Promise.resolve(cacheContent.response);
    }

    return network;
  }

  // CACHE_ONLY - Fail if nothing in cache
  if (cacheStrategy === CachingStrategy.CACHE_ONLY) {
    if (cacheContent) {
      return Promise.resolve(cacheContent.response);
    }

    return Promise.reject(
      getLocalNetworkError('No cache for this request', reqOptions, params?.collection),
    );
  }

  // PREFER_CACHE - Use cache if available
  if (cacheStrategy === CachingStrategy.CACHE_FIRST) {
    return cacheContent ? Promise.resolve(cacheContent.response) : makeNetworkCall<T>(params, true);
  }

  // STALE_AND_UPDATE - Use cache and update response once network is complete
  if (cacheStrategy === CachingStrategy.STALE_AND_UPDATE) {
    const existingResponse = cacheContent?.response?.clone();

    const network = makeNetworkCall<T>(params, true, existingResponse);

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

export function libFetch<T extends IJsonapiModel = IJsonapiModel>(options: ICollectionFetchOpts) {
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
): Promise<LibResponse<T>> {
  if (link) {
    const href: string = typeof link === 'object' ? link.href : link;

    if (href) {
      return read<T>(href, collection, options, views);
    }
  }

  return Promise.resolve(new LibResponse({ data: undefined }, collection));
}

export function handleResponse<T extends IJsonapiModel = IJsonapiModel>(
  record: T,
  prop?: string,
): (response: LibResponse<T>) => T {
  return action(
    (response: LibResponse<T>): T => {
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

      return response.replaceData(record).data as T;
    },
  );
}
