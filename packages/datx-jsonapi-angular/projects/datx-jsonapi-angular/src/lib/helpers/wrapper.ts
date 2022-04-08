import { Observable, Subject } from 'rxjs';

import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { IRxFetchOptions } from '../interfaces/IRxFetchOptions';
import { Response } from '../Response';

export function observableWrapper<T extends IJsonapiModel = IJsonapiModel, U = Response<T>>(
  fn: (options: IRxFetchOptions) => Promise<U> | Observable<U>,
): Observable<U> {
  return new Observable((subscriber) => {
    const takeUntil$ = new Subject<void>();

    let req = fn({
      fetchOptions: {
        takeUntil$,
        Response,
      },
    });

    if (req instanceof Observable) {
      // Not sure if this is needed, maybe the types are incorrect and req is actually always a Promise
      req = req.toPromise() as Promise<U>;
    }

    req.then(
      (response: U) => {
        subscriber.next(response);
        subscriber.complete();
      },
      (error) => {
        subscriber.error(error);
      },
    );

    return (): void => {
      takeUntil$.next();
      takeUntil$.complete();
    };
  });
}
