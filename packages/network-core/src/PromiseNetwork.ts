import { PureModel } from '@datx/core';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { Network } from './Network';
import { Response } from './Response';

export class PromiseNetwork extends Network<Promise<any>> {
  constructor(private readonly fetchReference: typeof fetch) {
    super();
    // Add fetch interceptor
  }

  public exec<T, U = unknown>(
    asyncVal: Promise<U>,
    successFn?: (value: U) => T,
    failureFn?: (error: Error) => T,
  ): Promise<T> {
    return asyncVal.then(successFn, failureFn);
  }

  public baseFetch<T extends TModel | Array<TModel>, TModel extends PureModel = PureModel>(
    request: IFetchOptions,
  ): Promise<Response<T>> {
    return this.fetchReference(request.url)
      .then((res) => {
        if (!res.status) {
          throw new Error('Network error');
        }
        return res.json();
      })
      .then((data) => new Response<T, TModel>(data))
      .catch(
        (error) => new Response<T, TModel>({ error }),
      );
  }
}
