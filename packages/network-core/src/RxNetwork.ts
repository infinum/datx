import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseRequest } from './BaseRequest';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { IResponseObject } from './interfaces/IResponseObject';
import { Network } from './Network';

export class RxNetwork extends Network<Observable<any>> {
  public readonly baseRequest!: BaseRequest<Observable<any>>;

  public exec<T, U = any>(asyncVal: Observable<U>, mapFn: (value: U) => T): Observable<T> {
    return asyncVal.pipe(map(mapFn));
  }

  public baseFetch(request: IFetchOptions): Observable<IResponseObject> {
    // TODO: Angular implementation
    // @ts-ignore
    return window
      .fetch(request.url)
      .then((res) => res.json())
      .then((data) => ({ data }));
  }
}
