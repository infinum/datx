import * as fs from 'fs';
import { isFunction } from 'lodash';
import * as path from 'path';
import * as nodeUrl from 'url';
import { v1 } from 'uuid';

import { config, IHeaders, IRawResponse } from '@datx/jsonapi';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

function getMockStream(name: string): string {
  const testPath = path.join(__dirname, `../mock/${name}.json`);

  return fs.existsSync(testPath) ? fs.readFileSync(testPath, 'utf-8') : 'null';
}

interface IRequestOptions {
  id: string;
  name?: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, any>;
  reqheaders?: Record<string, any>;
  status: number;
  responseFn?(url: RequestInfo, body?: string): void;
}

export interface IMockArgs extends Partial<IRequestOptions> {
  hostname?: string;
  query?: boolean | string | (() => boolean) | object;
}

const expectedRequests: Array<IRequestOptions & { done: boolean }> = [];

const executedRequests: Array<{
  url: RequestInfo;
  id: string;
}> = [];


function fetchInterceptor(method: string, url: string, body: any, requestHeaders: IHeaders, fetchOptions: any): Promise<IRawResponse> {
  const takeUntil$: Observable<void> | undefined = fetchOptions?.takeUntil$;

  let request$ = new Observable<IRawResponse>((subscriber) => {
    const request = expectedRequests.find(
      (req) => req.url === url && req.method === (method || 'GET') && !req.done,
    );
  
    if (!request) {
      subscriber.error({
        data: {},
        headers: new Headers(),
        requestHeaders,
        status: 0,
        error: new Error(`Unexpected request: ${method || 'GET'} ${url}`),
      });
      throw new Error(`Unexpected request: ${method || 'GET'} ${url}`);
    }
  
    executedRequests.push({ url, id: request.id });
    request.done = true;
  
    if (request.reqheaders) {
      expect(Object.assign({}, config.defaultFetchOptions?.headers, requestHeaders)).toMatchObject(request.reqheaders);
    }
  
    if (request.data) {
      const expected = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
      const received =
        body && typeof body === 'string'
          ? body
          : JSON.stringify(body);
  
      expect(received).toBe(expected);
    }
    
    const data = getMockStream(request.name || request.url);

    try {
      const parsed = JSON.parse(data);
      let response;

      if (request.responseFn) {
        response = request.responseFn(url, body as string);
      }

      if (request.status >= 200 && request.status < 300) {
        subscriber.next({
          data: response === undefined ? parsed : response,
          headers: new Headers(),
          requestHeaders,
          status: request.status,
        });
      } else {
        subscriber.error({
          message: `Invalid HTTP status: ${request.status}`,
          status: request.status,
        });
      }
    } catch (e) {
      subscriber.error({
        error: e,
        headers: new Headers(),
        requestHeaders,
        status: 0,
      });
    }
    subscriber.complete();
  });

  if (takeUntil$) {
    request$ = request$.pipe(takeUntil(takeUntil$));
  }

  return request$.toPromise().then((d) => {
    if (d === undefined) {
      throw new Error('Request canceled');
    }

    return d;
  });
}

export function setupNetwork(): void {
  expectedRequests.length = 0;
  executedRequests.length = 0;
  config.baseFetch = fetchInterceptor;
}

export function confirmNetwork(): void {
  expect(expectedRequests).toHaveLength(executedRequests.length);
}

/**
 * Prepare a mock API call
 *
 * @param {object} param - Param object
 * @param {String} param.name - Name of the mock API call
 * @param {String} [param.method=requestType.READ] - HTTP method to be used
 * @param {String} [param.hostname=config.root] - Hostname to be mocked
 * @param {String} [param.url='/'] - URL to be mocked
 * @param {any} [param.data] - Expected body
 * @param {Function} [param.query=true] - Function to be called during the query step
 * @param {Function} param.responseFn - Function to be called when response should be sent
 * @param {object} [param.headers={'content-type': 'application/vnd.api+json'}]
 *   HTTP headers to be used in the mock response
 * @param {object} [reqheaders={'content-type': 'application/vnd.api+json'}]
 *   Expected request headers
 * @param {Number} status - HTTP status code that should be returned
 * @return {undefined}
 */
export function setRequest({
  name,
  method = 'GET',
  url = '/',
  data,
  query = true,
  responseFn,
  headers = { 'content-type': 'application/vnd.api+json' },
  reqheaders = { 'content-type': 'application/vnd.api+json' },
  status = 200,
}: IMockArgs): { isDone(): boolean } {
  const apiUrl = nodeUrl.parse(config.baseUrl);
  const hostname = `${apiUrl.protocol}//${apiUrl.hostname}`;
  const pathname = apiUrl.pathname || '';

  let queryString = '';

  if (typeof query === 'object' && !isFunction(query)) {
    queryString = `?${Object.keys(query).map((key) => `${key}=${query[key]}`)}`;
  } else if (typeof query === 'string') {
    queryString = `?${query}`;
  }

  const id = v1();
  const targetUrl = `${hostname}${pathname}${url}${queryString}`;

  expectedRequests.push({
    id,
    name,
    method,
    url: targetUrl,
    data,
    headers,
    reqheaders,
    status,
    responseFn,
    done: false,
  });

  return {
    isDone(): boolean {
      return Boolean(executedRequests.find((req) => req.id === id));
    },
  };
}
