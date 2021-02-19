import { PureModel } from '@datx/core';
import { IFetchOptions, IHeaders, IResponseObject, INetworkHandler } from '@datx/network';
import { IResponseHeaders } from '@datx/utils';
import { Response as ResponseClass } from '../Response';

function parseResponse(
  response: IResponseObject,
  parse: (data: Record<string, unknown>, options: IResponseObject) => Record<string, unknown>,
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
  serialize: (options: IFetchOptions) => IFetchOptions = (options: IFetchOptions): IFetchOptions => options,
  parse: (data: Record<string, unknown>, options: IResponseObject) => Record<string, unknown> = (data): Record<string, unknown> => data,
  Response: typeof ResponseClass = ResponseClass,
) {
  return (request: IFetchOptions, _next?: INetworkHandler): Promise<ResponseClass<T>> => {
    if (!fetchReference) {
      throw new Error('The fetch reference must be defined');
    }

    const payload = serialize ? serialize(request) : request;

    let data: Record<string, unknown>;
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
      .then((responseData: Record<string, unknown>) => {
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
