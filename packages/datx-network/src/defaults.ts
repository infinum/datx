import { IConfigType } from './interfaces/IConfigType';
import { IHeaders } from './interfaces/IHeaders';
import { CachingStrategy } from './enums/CachingStrategy';
import { isBrowser } from './helpers/utils';
import { ParamArrayType } from './enums/ParamArrayType';
import { BaseRequest } from './BaseRequest';
import { IResponseHeaders } from './interfaces/IResponseHeaders';
import { PureModel } from 'datx';
import { IResponseObject } from './interfaces/IResponseObject';
import { BodyType } from './enums/BodyType';

/**
 * Base implementation of the fetch function (can be overridden)
 *
 * @param {IConfigType} config The request config
 * @param {string} method API call method
 * @param {string} url API call URL
 * @param {object} [body] API call body
 * @param {IHeaders} [requestHeaders] Headers that will be sent
 * @returns {Promise<IResponseObject>} Resolves with a raw response object
 */
export function baseFetch<TModel extends PureModel, TParams extends object>(
  requestObj: BaseRequest<TModel, TParams>,
  method: string,
  url: string,
  body?: string | FormData,
  requestHeaders: IHeaders = {},
): Promise<IResponseObject> {
  let data: object;
  let status = 0;
  let headers: IResponseHeaders;

  const request: Promise<void> = Promise.resolve();

  const uppercaseMethod = method.toUpperCase();
  const isBodySupported = uppercaseMethod !== 'GET' && uppercaseMethod !== 'HEAD';

  return request
    .then(() => {
      const reqHeaders: IHeaders = Object.assign({}, requestHeaders) as IHeaders;
      const options = Object.assign({
        body: (isBodySupported && body) || undefined,
        headers: reqHeaders,
        method,
      });

      if (requestObj['_config'].fetchReference) {
        return requestObj['_config'].fetchReference(url, options);
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
      if (status === 0) {
        throw null;
      }
      throw error;
    })
    .then((responseData: object) => {
      data = responseData;
      if (status >= 400) {
        throw {
          message: `Invalid HTTP status: ${status}`,
          status,
        };
      }

      return {
        data,
        headers,
        requestHeaders,
        status,
      };
    })
    .catch((error) => {
      throw {
        data,
        error,
        headers,
        requestHeaders,
        status,
      };
    });
}

export function getDefaultConfig(): IConfigType {
  return {
    // Base URL for all API calls
    baseUrl: '/',

    // Enable caching by default in the browser
    cache: isBrowser ? CachingStrategy.CacheFirst : CachingStrategy.NetworkOnly,
    maxCacheAge: Infinity,

    encodeQueryString: true,

    // Reference of the fetch method that should be used
    fetchReference:
      (isBrowser &&
        'fetch' in window &&
        typeof window.fetch === 'function' &&
        window.fetch.bind(window)) ||
      undefined,

    // Determines how will the request param arrays be stringified
    paramArrayType: ParamArrayType.ParamArray,

    serialize(data: any, _type: BodyType): any {
      return data;
    },

    parse(data: IResponseObject): IResponseObject {
      return data;
    },
  };
}
