import * as fs from 'fs';
import { isFunction } from 'lodash';
import * as path from 'path';
import * as nodeUrl from 'url';
import { v1 } from 'uuid';

import { config } from '../../src/NetworkUtils';

function getMockStream(name: string): string {
  const testPath = path.join(__dirname, `../mock/${name}.json`);

  return fs.readFileSync(testPath, 'utf-8');
}

export interface IMockArgs {
  name?: string;
  method?: string;
  hostname?: string;
  url?: string;
  data?: any;
  query?: boolean | (() => boolean) | object;
  headers?: Record<string, any>;
  reqheaders?: Record<string, any>;
  status?: number;
  responseFn?(...args: Array<any>): void;
}

const expectedRequests: Array<{
  id: string;
  name?: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, any>;
  reqheaders?: Record<string, any>;
  status: number;
  responseFn?(...args: Array<any>): void;
}> = [];

const executedRequests: Array<{
  url: RequestInfo;
  options: RequestInit | undefined;
  id: string;
}> = [];

function fetchInterceptor(url: RequestInfo, options?: RequestInit | undefined): Promise<Response> {
  const request = expectedRequests.find(
    (req) => req.url === url && req.method === (options?.method || 'GET'),
  );

  if (!request) {
    throw new Error(`Unexpected request: ${options?.method || 'GET'} ${url}`);
  }

  executedRequests.push({ url, options, id: request.id });
  return (Promise.resolve({
    status: request.status,
    headers: request.reqheaders,
    json() {
      return new Promise((resolve) => {
        if (request.responseFn) {
          request.responseFn(url, options?.body);
        }
        const data = getMockStream(request.name || request.url);

        resolve(JSON.parse(data));
      });
    },
  }) as unknown) as Promise<Response>;
}

export function setupNetwork() {
  expectedRequests.length = 0;
  executedRequests.length = 0;
  config.fetchReference = fetchInterceptor;
}

export function confirmNetwork() {
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
}: IMockArgs): { isDone(): boolean; assert(): void } {
  const apiUrl = nodeUrl.parse(config.baseUrl);
  const hostname = `${apiUrl.protocol}//${apiUrl.hostname}`;
  const pathname = apiUrl.pathname || '';

  let queryString = '';

  if (typeof query === 'object' && !isFunction(query)) {
    queryString = `?${Object.keys(query).map((key) => `${key}=${query[key]}`)}`;
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
  });

  return {
    assert() {
      const request = executedRequests.find((req) => req.id === id);
      const expectedRequest = expectedRequests.find((req) => req.id === id);

      expect(request).toBeTruthy();

      if (expectedRequest?.headers) {
        expect(request?.options?.headers).toEqual(expectedRequest.headers);
      }
    },

    isDone() {
      return Boolean(executedRequests.find((req) => req.id === id));
    },
  };
}
