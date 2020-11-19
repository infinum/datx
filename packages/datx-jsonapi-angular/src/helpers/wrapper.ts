import { Response as PromiseResponse } from 'datx-jsonapi';
import { Observable, Subject } from 'rxjs';

import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { IRxFetchOptions } from '../interfaces/IRxFetchOptions';
import { Response } from '../Response';

export function observableWrapper<T extends IJsonapiModel = IJsonapiModel, U = Response<T>>(fn: (options: IRxFetchOptions) => Observable<U>): Observable<U> {
  return new Observable((subscriber) => {
    const takeUntil$ = new Subject<void>();

    (fn({
      fetchOptions: {
        takeUntil$,
      },
    }) as unknown as Promise<PromiseResponse<any>>).then((response: PromiseResponse<any>) => {
      subscriber.next(response.clone(Response as any) as unknown as U);
    });

    return (): void => {
      takeUntil$.next();
      takeUntil$.complete();
    }
  });
}