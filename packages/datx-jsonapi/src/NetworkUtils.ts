import {storage} from 'datx/dist/services/storage';
import {fetch, Response} from 'isomorphic-fetch';

import {MODEL_PERSISTED_FIELD, MODEL_PROP_FIELD, MODEL_QUEUE_FIELD, MODEL_RELATED_FIELD} from './consts';
import {ParamArrayType} from './enums/ParamArrayType';
import {isBrowser} from './helpers/utils';
import {IDictionary} from './interfaces/IDictionary';
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
  options?: IRequestOptions;
  data?: object;
  method: string;
  collection: IJsonapiCollection;
}

export type CollectionFetchType = (options: ICollectionFetchOpts) => Promise<LibResponse>;

export interface IConfigType {
  baseFetch: FetchType;
  baseUrl: string;
  defaultHeaders: IHeaders;
  fetchReference: fetch;
  paramArrayType: ParamArrayType;
  collectionFetch: CollectionFetchType;
  transformRequest: (options: ICollectionFetchOpts) => ICollectionFetchOpts;
  transformResponse: (response: IRawResponse) => IRawResponse;
}

export const config: IConfigType = {

  /** Base URL for all API calls */
  baseUrl: '/',

  /** Default headers that will be sent to the server */
  defaultHeaders: {
    'content-type': 'application/vnd.api+json',
  },

  /** Reference of the fetch method that should be used */
  fetchReference: isBrowser && window.fetch.bind(window),

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
        const reqHeaders: IHeaders = Object.assign({}, config.defaultHeaders, requestHeaders) as IHeaders;
        return this.fetchReference(url, {
          body: isBodySupported && JSON.stringify(body) || undefined,
          headers: reqHeaders,
          method,
        });
      })
      .then((response: Response) => {
        status = response.status;
        headers = response.headers;
        return response.json();
      })
      .catch((e: Error) => {
        if (status === 204) {
          return null;
        }
        throw e;
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
        return {data, error, headers, requestHeaders, status};
      });
  },
  /**
   * Base implementation of the statefull fetch function (can be overridden)
   *
   * @param {ICollectionFetchOpts} reqOptions API request options
   * @returns {Promise<Response>} Resolves with a response object
   */
  collectionFetch(reqOptions: ICollectionFetchOpts): Promise<LibResponse> {
    const {
      url,
      options,
      data,
      method = 'GET',
      collection,
    } = config.transformRequest(reqOptions);

    return config.baseFetch(method, url, data, options && options.headers)
      .then((response: IRawResponse) => {
        return new LibResponse(config.transformResponse(response), collection, options);
      });
  },

  transformRequest(options: ICollectionFetchOpts): ICollectionFetchOpts {
    return options;
  },

  transformResponse(response: IRawResponse): IRawResponse {
    return response;
  },
};

export function fetch(options: ICollectionFetchOpts) {
  return config.collectionFetch(options);
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
export function read(
  collection: IJsonapiCollection,
  url: string,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse> {
  return config.collectionFetch({
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
export function create(
  collection: IJsonapiCollection,
  url: string,
  data?: object,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse> {
  return config.collectionFetch({
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
export function update(
  collection: IJsonapiCollection,
  url: string,
  data?: object,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse> {
  return config.collectionFetch({
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
export function remove(
  collection: IJsonapiCollection,
  url: string,
  headers?: IHeaders,
  options?: IRequestOptions,
): Promise<LibResponse> {
  return config.collectionFetch({
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
export function fetchLink(
  link: ILink,
  collection: IJsonapiCollection,
  requestHeaders?: IDictionary<string>,
  options?: IRequestOptions,
): Promise<LibResponse> {
  if (link) {
    const href: string = typeof link === 'object' ? link.href : link;

    if (href) {
      return read(collection, href, requestHeaders, options);
    }
  }
  return Promise.resolve(new LibResponse({data: undefined}, collection));
}
export function handleResponse(record: IJsonapiModel, prop?: string): (LibResponse) => IJsonapiModel {
  return (response: LibResponse): IJsonapiModel => {

    if (response.error) {
      throw response.error;
    }

    if (response.status === 204) {
      storage.setModelMetaKey(record, MODEL_PERSISTED_FIELD, true);
      return record as IJsonapiModel;
    } else if (response.status === 202) {
      const responseRecord = response.data as IJsonapiModel;
      storage.setModelMetaKey(responseRecord, MODEL_PROP_FIELD, prop);
      storage.setModelMetaKey(responseRecord, MODEL_QUEUE_FIELD, true);
      storage.setModelMetaKey(responseRecord, MODEL_RELATED_FIELD, record);
      return responseRecord;
    } else {
      storage.setModelMetaKey(record, MODEL_PERSISTED_FIELD, true);
      return response.replaceData(record).data as IJsonapiModel;
    }
  };
}
