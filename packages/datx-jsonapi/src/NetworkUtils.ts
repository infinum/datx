import {setModelMetaKey} from 'datx';
import {IDictionary} from 'datx-utils';
import {fetch, Response} from 'isomorphic-fetch';

import {getCache, saveCache} from './cache';
import {MODEL_PERSISTED_FIELD, MODEL_PROP_FIELD, MODEL_QUEUE_FIELD, MODEL_RELATED_FIELD} from './consts';
import {ParamArrayType} from './enums/ParamArrayType';
import {isBrowser} from './helpers/utils';
import {IHeaders} from './interfaces/IHeaders';
import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {IRawResponse} from './interfaces/IRawResponse';
import {IRequestOptions} from './interfaces/IRequestOptions';
import {IResponseHeaders} from './interfaces/IResponseHeaders';
import {ILink, IResponse} from './interfaces/JsonApi';
import {Response as LibResponse} from './Response';

declare var window: {fetch?: fetch};

export type FetchType = (
  method: string,
  url: string,
  body?: object,
  requestHeaders?: IHeaders,
) => Promise<IRawResponse>;

export interface ICollectionFetchOpts {
  url: string;
  options?: IRequestOptions&{headers?: IHeaders};
  data?: object;
  method: string;
  collection?: IJsonapiCollection;
  skipCache?: boolean;
}

export type CollectionFetchType = <T extends IJsonapiModel>(options: ICollectionFetchOpts) => Promise<LibResponse<T>>;

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
  cache: boolean,
  defaultFetchOptions: IDictionary<any>;
  fetchReference: fetch;
  paramArrayType: ParamArrayType;
  onError: (IResponseObject) => IResponseObject;
  transformRequest: (options: ICollectionFetchOpts) => ICollectionFetchOpts;
  transformResponse: (response: IRawResponse) => IRawResponse;
}

export const config: IConfigType = {

  /** Base URL for all API calls */
  baseUrl: '/',

  /** Enable caching by default in the browser */
  cache: isBrowser,

  /** Default options that will be passed to the fetch function */
  defaultFetchOptions: {
    headers: {
      'content-type': 'application/vnd.api+json',
    },
  },

  /** Reference of the fetch method that should be used */
  fetchReference: isBrowser && 'fetch' in window && window.fetch.bind(window),

  /** Determines how will the request param arrays be stringified */
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
          body: isBodySupported && JSON.stringify(body) || undefined,
          headers: reqHeaders,
          method,
        });
        return this.fetchReference(url, options);
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

        return {data, headers, requestHeaders, status};
      })
      .catch((error) => {
        return this.onError({data, error, headers, requestHeaders, status});
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

/**
 * Base implementation of the statefull fetch function (can be overridden)
 *
 * @param {ICollectionFetchOpts} reqOptions API request options
 * @returns {Promise<Response>} Resolves with a response object
 */
function collectionFetch<T extends IJsonapiModel>(reqOptions: ICollectionFetchOpts): Promise<LibResponse<T>> {
  const {
    url,
    options,
    data,
    method = 'GET',
    collection,
  } = config.transformRequest(reqOptions);

  const staticCollection = collection && collection.constructor as {cache?: boolean};
  const collectionCache = staticCollection && staticCollection.cache;
  const isCacheSupported = method.toUpperCase() === 'GET';
  const skipCache = reqOptions.options && reqOptions.options.skipCache;

  if (config.cache && isCacheSupported && collectionCache && !skipCache) {
    const cache = getCache(url);
    if (cache) {
      return Promise.resolve(cache.response) as Promise<LibResponse<T>>;
    }
  }

  return config.baseFetch(method, url, data, options && options.headers)
    .then((response: IRawResponse) => {
      const resp = new LibResponse<T>(config.transformResponse(response), collection, options);
      if (config.cache && isCacheSupported) {
        saveCache(url, resp);
      }
      return resp;
    });
}

export function fetch<T extends IJsonapiModel = IJsonapiModel>(options: ICollectionFetchOpts) {
  return collectionFetch<T>(options);
}

/**
 * API call used to get data from the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function read<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  collection?: IJsonapiCollection,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data: undefined,
    method: 'GET',
    options: {...options, headers},
    url,
  });
}

/**
 * API call used to create data on the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function create<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  data?: object,
  collection?: IJsonapiCollection,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data,
    method: 'POST',
    options: {...options, headers},
    url,
  });
}

/**
 * API call used to update data on the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {object} [data] Request body
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function update<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  data?: object,
  collection?: IJsonapiCollection,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data,
    method: 'PATCH',
    options: {...options, headers},
    url,
  });
}

/**
 * API call used to remove data from the server
 *
 * @export
 * @param {IJsonapiCollection} collection Related collection
 * @param {string} url API call URL
 * @param {IHeaders} [headers] Headers to be sent
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<Response>} Resolves with a Response object
 */
export function remove<T extends IJsonapiModel = IJsonapiModel>(
  url: string,
  collection?: IJsonapiCollection,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse<T>> {
  return collectionFetch<T>({
    collection,
    data: undefined,
    method: 'DELETE',
    options: {...options, headers},
    url,
  });
}

/**
 * Fetch a link from the server
 *
 * @export
 * @param {JsonApi.ILink} link Link URL or a link object
 * @param {IJsonapiCollection} collection Store that will be used to save the response
 * @param {IDictionary<string>} [requestHeaders] Request headers
 * @param {IRequestOptions} [options] Server options
 * @returns {Promise<LibResponse>} Response promise
 */
export function fetchLink<T extends IJsonapiModel = IJsonapiModel>(
  link: ILink,
  collection?: IJsonapiCollection,
  requestHeaders?: IDictionary<string>,
  options?: IRequestOptions,
): Promise<LibResponse<T>> {
  if (link) {
    const href: string = typeof link === 'object' ? link.href : link;

    if (href) {
      return read<T>(href, collection, requestHeaders, options);
    }
  }
  return Promise.resolve(new LibResponse({data: undefined}, collection));
}

export function handleResponse<T extends IJsonapiModel = IJsonapiModel>(
  record: T,
  prop?: string,
): (response: LibResponse<T>) => T {
  return (response: LibResponse<T>): T => {

    if (response.error) {
      throw response.error;
    }

    if (response.status === 204) {
      setModelMetaKey(record, MODEL_PERSISTED_FIELD, true);
      return record as T;
    } else if (response.status === 202) {
      const responseRecord = response.data as T;
      setModelMetaKey(responseRecord, MODEL_PROP_FIELD, prop);
      setModelMetaKey(responseRecord, MODEL_QUEUE_FIELD, true);
      setModelMetaKey(responseRecord, MODEL_RELATED_FIELD, record);
      return responseRecord;
    } else {
      setModelMetaKey(record, MODEL_PERSISTED_FIELD, true);
      return response.replaceData(record).data as T;
    }
  };
}
