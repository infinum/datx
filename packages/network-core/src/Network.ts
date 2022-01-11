/* eslint-disable @typescript-eslint/no-explicit-any */

import { IAsync } from './interfaces/IAsync';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { IGeneralize } from './interfaces/IGeneralize';
import { IResponseObject } from './interfaces/IResponseObject';

interface IChainable<IA extends IAsync<U> = IAsync<any>, U = any> {
  value: IA;
  then<TNext>(
    successFn: (data: U) => TNext,
    failFn?: (err: Error) => TNext,
  ): IChainable<IGeneralize<TNext, IA>, TNext>;
  catch<TNext>(failFn?: (err: Error) => TNext): IChainable<IA, U>;
}

export abstract class Network<IA extends IAsync<any> = IAsync<any>> {
  constructor(protected readonly fetchReference?: typeof fetch) {}

  abstract exec<T, U = any>(
    asyncVal: IGeneralize<U, IA>,
    successFn?: (value: U) => T,
    failureFn?: (error: Error) => T,
  ): IGeneralize<T, IA>;

  abstract execAll<T>(...asyncVal: Array<IGeneralize<T, IA>>): IGeneralize<Array<T>, IA>;

  abstract baseFetch(request: IRequestDetails): {
    response: IGeneralize<IResponseObject, IA>;
    abort?: () => void;
  };

  public chain<U = any>(asyncVal: IGeneralize<U, IA>): IChainable<IGeneralize<U, IA>> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const network = this;

    return {
      value: asyncVal,
      then<TNext>(successFn: (data: U) => TNext, failFn?: (err: Error) => TNext) {
        return network.chain(network.exec<TNext, U>(asyncVal, successFn, failFn)) as any;
      },
      catch<TNext>(failFn?: (err: Error) => TNext) {
        return network.chain(network.exec<TNext, U>(asyncVal, (data) => data, failFn)) as any;
      },
    };
  }
}
