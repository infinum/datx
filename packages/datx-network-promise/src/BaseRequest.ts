import { BaseRequest as NetworkBaseRequest } from '@datx/network';

import { fetchInterceptor } from './interceptors/fetch';

export class BaseRequest extends NetworkBaseRequest {
  constructor(baseUrl: string) {
    super(baseUrl);
    this._config.fetchInterceptor = fetchInterceptor;
  }
}
