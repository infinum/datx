export { Client } from './Client';
import { MockPromiseNetwork } from './MockPromiseNetwork';
import { PromiseNetwork } from './PromiseNetwork';
import { RxNetwork } from './RxNetwork';

export { Request } from './Request';
export { Response } from './Response';
export { QueryBuilder } from './QueryBuilder';

export { IResponseHeaders } from '@datx/utils';

export { HttpMethod } from './enums/HttpMethod';
export { ParamArrayType } from './enums/ParamArrayType';

export { IAsync } from './interfaces/IAsync';
export { IGeneralize } from './interfaces/IGeneralize';
export { IHeaders } from './interfaces/IHeaders';
export { INetwork } from './interfaces/INetwork';
export { IQueryConfig } from './interfaces/IQueryConfig';
export { IResponseObject } from './interfaces/IResponseObject';
export { IResponseSnapshot } from './interfaces/IResponseSnapshot';
export { IRequestDetails } from './interfaces/IRequestDetails';
export { ISubrequest } from './interfaces/ISubrequest';

export { isModelPersisted, setModelPersisted } from './helpers/model';
export { appendQueryParams, parametrize, interpolateParams } from './helpers/utils';

export const Network = {
  Promise: PromiseNetwork,
  Rx: RxNetwork,
  Mock: { Promise: MockPromiseNetwork },
};
