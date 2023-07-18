import * as fs from 'fs';
import { isFunction } from 'lodash';
import * as path from 'path';
import * as nodeUrl from 'url';

import { config } from '../../src/NetworkUtils';

const v1 = () => Math.random().toString();

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
  options: RequestInit | undefined;
  id: string;
}> = [];

function fetchInterceptor(url: RequestInfo, options?: RequestInit | undefined): Promise<Response> {
  const request = expectedRequests.find(
    (req) => req.url === url && req.method === (options?.method || 'GET') && !req.done,
  );

  if (!request) {
    throw new Error(`Unexpected request: ${options?.method || 'GET'} ${url}`);
  }

  executedRequests.push({ url, options, id: request.id });
  request.done = true;

  if (request.reqheaders) {
    expect(options?.headers).toMatchObject(request.reqheaders);
  }

  if (request.data) {
    const expected = typeof request.data === 'string' ? request.data : JSON.stringify(request.data);
    const received =
      options && options.body && typeof options.body === 'string'
        ? options?.body
        : JSON.stringify(options?.body);

    expect(received).toBe(expected);
  }

  return new Promise((resolve, reject) => {
    const data = getMockStream(request.name || request.url);

    try {
      const parsed = JSON.parse(data);

      resolve({
        ok: request.status >= 200 && request.status < 300,
        status: request.status,
        headers: new Headers(request.headers),
        json() {
          let response;

          if (request.responseFn) {
            response = request.responseFn(url, options?.body as string);
          }

          return Promise.resolve(response === undefined ? parsed : response);
        },
      } as any);
    } catch (e) {
      reject({
        name: 'JSON.parse',
        message: 'JSON parse failed',
        type: 'error',
      });
    }
  });
}

export function setupNetwork(): void {
  expectedRequests.length = 0;
  executedRequests.length = 0;
  config.fetchReference = fetchInterceptor;
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
