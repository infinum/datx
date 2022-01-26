import { Bucket, PureCollection, PureModel } from '@datx/core';

import { IResponseInternal } from './interfaces/IResponseInternal';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';

function initData<
  TModel extends PureModel,
  TResponse extends TModel | Array<TModel>,
  T extends PureModel | Array<PureModel>,
>(response: IResponseSnapshot, collection: PureCollection, overrideData?: T): { value: TResponse } {
  let data: TResponse;
  const responseData = response.response.data;
  const hasData = Boolean(responseData && Object.keys(responseData).length);
  if (responseData && hasData) {
    const ModelConstructor =
      (collection.constructor as typeof PureCollection).types.find(
        ({ type }) => type === response.type,
      ) || PureModel;

    // @ts-ignore
    data = overrideData || collection.add(responseData, ModelConstructor);
    return { value: data };
  }

  // @ts-ignore TODO
  return new Bucket.ToOneOrMany<T>(data, collection as any, true);
}

export class Response<
  TModel extends PureModel = PureModel,
  TResponse extends TModel | Array<TModel> = TModel | Array<TModel>,
> {
  public readonly included: Record<string, Response> = {};

  private __data!: { value: TResponse };

  protected __internal: IResponseInternal = {
    response: {},
    views: [],
  };

  constructor(
    public readonly snapshot: IResponseSnapshot,
    public readonly collection: PureCollection,
  ) {
    // this._data = (this.collection?.add(snapshot.response) as TResponse) ?? null;

    try {
      this.__data = initData(this.snapshot, this.collection);
    } catch (e) {
      console.log(e);
      this.__internal.error = e as Error;
    }
  }

  public get data(): TResponse {
    return this.__data.value;
  }

  public include(key: string, response: Response): void {
    this.included[key] = response;
  }
}
