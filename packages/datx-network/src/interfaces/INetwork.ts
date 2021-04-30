import { IAsync } from './IAsync';

export interface INetwork {
	exec<T, U = any, IAT = Promise<T>, IAU = Promise<U>>(asyncVal: IAU, mapFn: (value: U) => T): IAT;
	exec<T, U = any, IAT = Observable<T>, IAU = Observable<U>>(asyncVal: IAU, mapFn: (value: U) => T): IAT;

	baseFetch<T>(url: string, init?: object): IAsync<T>;
}