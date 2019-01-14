import * as fs from 'fs';
import * as path from 'path';
import * as nodeUrl from 'url';

import {IDictionary} from 'datx-utils';
import {constant, isFunction} from 'lodash';
import * as nock from 'nock';

import {config} from '../../src/NetworkUtils';

/**
 * Create a stream from a mock file
 *
 * @param {String} name - Mock name
 * @return {Stream} Mock stream
 */
function getMockStream(name: string): fs.ReadStream {
  const testPath = path.join(__dirname, `../mock/${name}.json`);

  return fs.createReadStream(testPath);
}

export interface IMockArgs {
  name?: string;
  method?: string;
  hostname?: string;
  url?: string;
  data?: any;
  query?: boolean | (() => boolean) | object;
  headers?: nock.HttpHeaders;
  reqheaders?: IDictionary;
  status?: number;
  responseFn?(...args: Array<any>): void;
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
// tslint:disable-next-line:no-default-export
export default function mockApi({
  name,
  method = 'GET',
  url = '/',
  data,
  query = true,
  responseFn,
  headers = {'content-type': 'application/vnd.api+json'},
  reqheaders = {'content-type': 'application/vnd.api+json'},
  status = 200,
}: IMockArgs): nock.Scope {
  const apiUrl = nodeUrl.parse(config.baseUrl);
  const hostname = `${apiUrl.protocol}//${apiUrl.hostname}`;
  const nockScope = nock(hostname, {reqheaders}).replyContentLength();
  const pathname = apiUrl.pathname || '';

  let mock = nockScope.intercept(pathname + url, method, data);

  if (query) {
    mock = mock.query(query);
  }

  return mock.reply(status, (...args: Array<any>) => {
    if (responseFn && isFunction(responseFn)) {
      if (responseFn(...args) !== undefined) {
        return;
      }
    }

    return [status, getMockStream(name || url)];
  }, headers);
}
