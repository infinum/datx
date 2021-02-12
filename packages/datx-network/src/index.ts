export { BaseRequest } from './BaseRequest';
export { Response } from './Response';

export {
  addInterceptor,
  cache,
  method,
  setUrl,
  body,
  query,
  header,
  params,
  encodeQueryString,
  paramArrayType,
  collection,
  requestOptions,
  upsertInterceptor,
} from './operators';

export { IResponseHeaders } from '@datx/utils';

export { clearAllCache, clearCacheByType } from './interceptors/cache';

export { CachingStrategy } from './enums/CachingStrategy';
export { HttpMethod } from './enums/HttpMethod';
export { ParamArrayType } from './enums/ParamArrayType';

export { IFetchOptions } from './interfaces/IFetchOptions';
export { IHeaders } from './interfaces/IHeaders';
export { IInterceptor } from './interfaces/IInterceptor';
export { INetworkHandler } from './interfaces/INetworkHandler';
export { IPipeOperator } from './interfaces/IPipeOperator';
export { IResponseObject } from './interfaces/IResponseObject';

export { appendQueryParams } from './helpers/utils';
