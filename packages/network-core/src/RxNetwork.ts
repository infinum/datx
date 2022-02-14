import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import type { HttpClient, HttpResponse } from '@angular/common/http';

import { IRequestDetails } from './interfaces/IRequestDetails';
import { IResponseObject } from './interfaces/IResponseObject';
import { Network } from './Network';

export class RxNetwork extends Network<Observable<unknown>> {
  constructor(private readonly http: HttpClient) {
    super();
  }

  public exec<T, U = unknown>(asyncVal: Observable<U>, mapFn: (value: U) => T): Observable<T> {
    return asyncVal.pipe(map(mapFn));
  }

  public execAll<T>(...asyncVal: Array<Observable<T>>): Observable<Array<T>> {
    return zip(...asyncVal);
  }

  public baseFetch(request: IRequestDetails): { response: Observable<IResponseObject> } {
    return {
      response: this.http
        .request(request.method, request.url, {
          body: request.body,
          headers: request?.headers,
        })
        .pipe(
          map((resp: HttpResponse<Record<string, unknown>>) => ({
            status: resp.status,
            headers: resp.headers,
            data: resp.body,
          })),
        ),
    };
  }
}
