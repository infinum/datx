export { Client } from './Client';
import { MockPromiseNetwork } from './MockPromiseNetwork';
import { PromiseNetwork } from './PromiseNetwork';
import { RxNetwork } from './RxNetwork';

export { Request } from './Request';
export { Response } from './Response';

export { IResponseHeaders } from '@datx/utils';

export { clearAllCache, clearCacheByType } from './interceptors/cache';

export { CachingStrategy } from './enums/CachingStrategy';
export { HttpMethod } from './enums/HttpMethod';
export { ParamArrayType } from './enums/ParamArrayType';

export { IFetchOptions } from './interfaces/IFetchOptions';
export { IHeaders } from './interfaces/IHeaders';
export { IInterceptor } from './interfaces/IInterceptor';
export { INetworkHandler } from './interfaces/INetworkHandler';
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

import { Collection, Model } from '@datx/core';
import { Client } from './Client';
import { Request, SwrRequest } from './Request';
import { QueryBuilder } from './QueryBuilder';

const pc = new Client({
  QueryBuilder,
  collection: new Collection(),
  network: new Network.Promise(window.fetch),
  request: SwrRequest,
});

const rc = new Client({
  QueryBuilder,
  collection: new Collection(),
  network: new Network.Rx(),
  request: Request,
});

class ModelA extends Model {
  public a = 'a';
}
class ModelB extends Model {
  public b = 'b';
}

pc.from(ModelA)
  .id('1')
  .request()
  .fetch()
  .then((resp) => {
    console.log(resp.data?.a);
  });

pc.from(ModelB)
  .id('1')
  .request((client, respB) => respB.data && client.from(ModelA).id(respB.data.b).request())
  .swr();

rc.from(ModelA)
  .id('1')
  .request()
  .fetch()
  .subscribe((resp) => {
    // @ts-expect-error
    console.log(resp.data?.b);
  });

rc.from(ModelA)
  .match({ a: 2 })
  .request(
    (client, respA) =>
      respA.data &&
      client
        .from(ModelA)
        .match({ a: respA.data?.map((a) => a.a).join(',') })
        .request(),
  )
  .fetch()
  .subscribe((resp) => {
    console.log(resp.data?.a);
  });
