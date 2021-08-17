import { PureModel } from '@datx/core';
import { IResponseHeaders } from '@datx/utils';

import { IFetchOptions } from '../interfaces/IFetchOptions';
import { INetworkHandler } from '../interfaces/INetworkHandler';
import { IResponseObject } from '../interfaces/IResponseObject';
import { IHeaders } from '../interfaces/IHeaders';
import { Response as ResponseClass } from '../Response';
import { INetwork } from '../interfaces/INetwork';

function parseResponse(
  response: IResponseObject,
  parse: (data: object, options: IResponseObject) => object,
): IResponseObject {
  if (response.data) {
    return {
      ...response,
      data: parse(response.data, response),
    };
  }

  return response;
}

export function fetchInterceptor<TNetwork extends INetwork, T extends PureModel>(
  Network: TNetwork,
  serialize: (options: IFetchOptions) => IFetchOptions = (options): IFetchOptions => options,
  parse: (data: object, options: IResponseObject) => object = (data): object => data,
  Response: typeof ResponseClass = ResponseClass,
) {
  return (request: IFetchOptions, _next?: INetworkHandler): Promise<ResponseClass<T>> => {
    const payload = serialize ? serialize(request) : request;

    let data: object;
    let status = 0;
    let headers: IResponseHeaders;

    const uppercaseMethod = payload.method.toUpperCase();
    const isBodySupported = uppercaseMethod !== 'GET' && uppercaseMethod !== 'HEAD';
    const bodyContent =
      typeof payload.data === 'object' && !(payload.data instanceof FormData)
        ? JSON.stringify(payload.data)
        : payload.data;
    const body = isBodySupported ? bodyContent : undefined;

    const requestHeaders: IHeaders = Object.assign(
      {},
      payload.options?.networkConfig?.headers,
    ) as IHeaders;
    const options = Object.assign({
      body,
      headers: requestHeaders,
      method: payload.method,
    });

    return Network.chain(Network.baseFetch(payload.url, options))
      .then((response: globalThis.Response) => {
        status = response.status;
        headers = response.headers;

        return response.json();
      })
      .catch((error: Error) => {
        if (status === 204) {
          return null;
        }
        if (status === 0) {
          throw new Error('Network not available');
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

        const response = parseResponse(
          {
            data,
            headers,
            requestHeaders,
            status,
            collection: request.collection,
            type: request.type,
          },
          parse,
        );
        return new Response<T>(response, request.collection, undefined, request.views);
      })
      .catch((error) => {
        const response = parseResponse(
          {
            data,
            error,
            headers,
            requestHeaders,
            status,
            collection: request.collection,
            type: request.type,
          },
          parse,
        );
        throw new Response<T>(response, request.collection, undefined, request.views);
      })
      .value;
  };
}
