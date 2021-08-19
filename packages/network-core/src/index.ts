export { NetworkClient } from './Client';
import { MockPromiseNetwork } from './MockPromiseNetwork';
import { PromiseNetwork } from './PromiseNetwork';
import { RxNetwork } from './RxNetwork';

export { BaseRequest } from './BaseRequest';
export { Response } from './Response';

export {
  addInterceptor,
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
export { IInterceptorsList } from './interfaces/IInterceptorsList';

export { appendQueryParams } from './helpers/utils';
export { saveModel } from './helpers/model';

export const Network = {
  Promise: PromiseNetwork,
  Rx: RxNetwork,
  Mock: { Promise: MockPromiseNetwork },
};

////////////////////////////////////////////////

// import { Collection, Model, PureModel } from '@datx/core';
// import { NetworkClient } from './Client';
// import { Response } from './Response';
// import { IGeneralize } from './interfaces/IGeneralize';
// import { INetwork } from './interfaces/INetwork';
// class MyClient<TNetwork extends INetwork> extends NetworkClient<TNetwork> {
//   getOne<TModel extends typeof PureModel, TInstance = InstanceType<TModel>>(
//     _type: TModel,
//     _id: string,
//   ): IGeneralize<Response<TInstance>, ReturnType<TNetwork['exec']>> {
//     return null as any;
//   }
// }

// const pc = new MyClient(new Collection(), new Network.Promise(window.fetch));
// const rc = new MyClient(new Collection(), new Network.Rx());

// pc.getOne(Model, '1').then((a) => {
//   a.data;
// });

// rc.getOne(Model, '1').subscribe((a) => {
//   a.data;
// });
