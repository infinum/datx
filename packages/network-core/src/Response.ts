import { Bucket, PureCollection, PureModel } from '@datx/core';
import { mapItems } from '@datx/utils';

import { IResponseInternal } from './interfaces/IResponseInternal';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';

function initData<
  TModel extends PureModel,
  TResponse extends TModel | Array<TModel>,
  T extends PureModel | Array<PureModel>,
>(
  response: IResponseSnapshot,
  collection: PureCollection,
  overrideData?: T,
): { value: TResponse | null } {
  let data: TResponse | null = null;
  const responseData = response.response;
  const hasData = Boolean(responseData && Object.keys(responseData).length);
  if (responseData && hasData) {
    // @ts-ignore
    data =
      overrideData ||
      (response.type ? collection.add(responseData, response.type) : collection.add(responseData));
  } else if (hasData) {
    const ModelConstructor =
      (collection.constructor as typeof PureCollection).types.find(
        ({ type }) => type === response.type,
      ) || PureModel;

    console.log(ModelConstructor);

    // @ts-ignore
    data = overrideData || mapItems(responseData, (item) => new ModelConstructor(item));
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

  private __data: { value: TResponse | null } | null = null;

  protected __internal: IResponseInternal = {
    response: {},
    views: [],
  };

  constructor(
    public readonly snapshot: IResponseSnapshot,
    private readonly collection: PureCollection,
  ) {
    // this._data = (this.collection?.add(snapshot.response) as TResponse) ?? null;

    try {
      this.__data = initData(this.snapshot, this.collection);
    } catch (e) {
      console.log(e);
      this.__internal.error = e as Error;
    }
  }

  public get data(): TResponse | null {
    return this.__data?.value || null;
  }

  public include(key: string, response: Response): void {
    this.included[key] = response;
  }
}
