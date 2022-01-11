export { Client } from './Client';
import { MockPromiseNetwork } from './MockPromiseNetwork';
import { PromiseNetwork } from './PromiseNetwork';
import { RxNetwork } from './RxNetwork';

export { Request } from './Request';
export { Response } from './Response';

export { IResponseHeaders } from '@datx/utils';

export { HttpMethod } from './enums/HttpMethod';
export { ParamArrayType } from './enums/ParamArrayType';

export { IFetchOptions } from './interfaces/IFetchOptions';
export { IHeaders } from './interfaces/IHeaders';
export { INetworkHandler } from './interfaces/INetworkHandler';
export { IResponseObject } from './interfaces/IResponseObject';

export { appendQueryParams } from './helpers/utils';
export { saveModel } from './helpers/model';

export const Network = {
  Promise: PromiseNetwork,
  Rx: RxNetwork,
  Mock: { Promise: MockPromiseNetwork },
};

////////////////////////////////////////////////

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';

import { Collection, Model } from '@datx/core';
import { Client } from './Client';
import { Request, SwrRequest } from './Request';
import { QueryBuilder } from './QueryBuilder';

TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
});
const httpMock = TestBed.inject(HttpClient);

const pc = new Client({
  QueryBuilder,
  collection: new Collection(),
  network: new Network.Promise(window.fetch),
  request: SwrRequest,
});

const rc = new Client({
  QueryBuilder,
  collection: new Collection(),
  network: new Network.Rx(httpMock),
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
  .buildRequest()
  .fetch()
  .then((resp) => {
    console.log(resp.data?.a);
  });

pc.from(ModelB)
  .id('1')
  .buildRequest(
    (client, respB) => respB.data && client.from(ModelA).id(respB.data.b).buildRequest(),
  )
  .swr();

rc.from(ModelA)
  .id('1')
  .buildRequest()
  .fetch()
  .subscribe((resp) => {
    // @ts-expect-error
    console.log(resp.data?.b);
  });

rc.from(ModelA)
  .match({ a: 2 })
  .buildRequest(
    (client, respA) =>
      respA.data &&
      client
        .from(ModelA)
        .match({ a: respA.data?.map((a) => a.a).join(',') })
        .buildRequest(),
  )
  .fetch()
  .subscribe((resp) => {
    console.log(resp.data?.a);
  });
