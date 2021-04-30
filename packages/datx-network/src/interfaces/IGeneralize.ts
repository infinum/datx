import { IAsync } from './IAsync';

export type IGeneralize<T, A extends IAsync<any>> = A extends Promise<any> ? Promise<T> : Observable<T, T>;