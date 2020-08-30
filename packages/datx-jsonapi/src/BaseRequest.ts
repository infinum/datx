import { BaseRequest as BaseNetworkRequest, IPipeOperator } from 'datx-network';
import { isJsonapi } from './operators';

export class BaseJsonapiRequest extends BaseNetworkRequest {
  constructor(baseUrl: string) {
    super(baseUrl);
    isJsonapi()(this);
  }
}

let genericBaseRequest: BaseJsonapiRequest = new BaseJsonapiRequest('/');

export function setBaseRequest(request: BaseJsonapiRequest): void {
  genericBaseRequest = request.pipe(isJsonapi());
}

export function getBaseRequest(): BaseJsonapiRequest {
  return genericBaseRequest;
}

export function pipeBaseRequest(...operators: Array<IPipeOperator>): BaseJsonapiRequest {
  return (genericBaseRequest = genericBaseRequest.pipe(...operators));
}
