import { PureModel } from '@datx/core';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { INetwork } from './interfaces/INetwork';
import { Response } from './Response';

export class PromiseNetwork implements INetwork<Promise<any>> {
  public exec<T, U = any>(asyncVal: Promise<U>, mapFn: (value: U) => T): Promise<T> {
    return asyncVal.then(mapFn);
  }

  public baseFetch<T extends TModel | Array<TModel>, TModel extends PureModel = PureModel>(
    request: IFetchOptions,
  ): Promise<Response<T>> {
    return window
      .fetch(request.url)
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
