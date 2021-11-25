import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export function asyncData<TData>(data: TData): Observable<TData> {
  return of(data).pipe(delay(0));
}
