import { BaseRequest as BaseNetworkRequest } from '@datx/network';
import { isJsonapi } from './operators';

export class BaseJsonapiRequest extends BaseNetworkRequest {
  constructor(baseUrl: string) {
    super(baseUrl);
    isJsonapi()(this);
  }
}
