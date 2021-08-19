import { Observable } from 'rxjs';

export type IAsync<T = any> = Promise<T> | Observable<T>;
