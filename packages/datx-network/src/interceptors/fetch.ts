import { PureModel } from 'datx';
import { IFetchOptions } from '../interfaces/IFetchOptions';
import { INetworkHandler } from '../interfaces/INetworkHandler';
import { IResponseObject } from '../interfaces/IResponseObject';
import { IResponseHeaders } from '../interfaces/IResponseHeaders';
import { IHeaders } from '../interfaces/IHeaders';
import { Response } from '../Response';

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

export function fetchInterceptor<T extends PureModel>(
  fetchReference?: typeof fetch,
  serialize: (options: IFetchOptions) => IFetchOptions = (options): IFetchOptions => options,
  parse: (data: object, options: IResponseObject) => object = (data): object => data,
) {
  return (request: IFetchOptions, _next?: INetworkHandler): Promise<Response<T>> => {
    if (!fetchReference) {
      throw new Error('The fetch reference must be defined');
    }

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

    return fetchReference(payload.url, options)
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
      });
  };
}
