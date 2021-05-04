import { PureModel } from '@datx/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IFetchOptions } from './interfaces/IFetchOptions';
import { INetwork } from './interfaces/INetwork';
import { Response } from './Response';

export class RxNetwork implements INetwork<Observable<any>> {
  public exec<T, U = any>(asyncVal: Observable<U>, mapFn: (value: U) => T): Observable<T> {
    return asyncVal.pipe(map(mapFn));
  }

  public baseFetch<T extends PureModel = PureModel>(
    request: IFetchOptions,
  ): Observable<Response<T>> {
    // @ts-ignore
    return window
      .fetch(request.url)
      .then((res) => res.json())
      .then((data) => new Response(data));
  }
}
