import { Observable, Subject } from 'rxjs';

import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { IRxFetchOptions } from '../interfaces/IRxFetchOptions';
import { Response } from '../Response';

export function observableWrapper<T extends IJsonapiModel = IJsonapiModel, U = Response<T>>(fn: (options: IRxFetchOptions) => Promise<U> | Observable<U>): Observable<U> {
  return new Observable((subscriber) => {
    const takeUntil$ = new Subject<void>();

    (fn({
      fetchOptions: {
        takeUntil$,
        Response,
      },
    }) as Promise<U>).then((response: U) => {
      subscriber.next(response);
    }, (error) => {
      subscriber.error(error);
    });

    return (): void => {
      takeUntil$.next();
      takeUntil$.complete();
    };
  });
}