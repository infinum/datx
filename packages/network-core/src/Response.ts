import { PureCollection, PureModel } from '@datx/core';

import { IResponseInternal } from './interfaces/IResponseInternal';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';

function initData<TModel extends PureModel, TResponse extends TModel | Array<TModel>>(
  response: IResponseSnapshot,
  collection: PureCollection,
  overrideData?: TResponse,
): { value: TResponse | null } {
  const responseData = response.response.data;

  if (!response.response.status || response.response.status > 299) {
    throw new Error(`Response status is ${response.response.status || 0}`);
  }

  if (typeof responseData === 'undefined' || typeof responseData === 'string') {
    if (response.response.error) {
      throw response.response.error;
    }

    throw new Error(`Response parsing failed: ${responseData}`);
  }

  const hasData = Boolean(responseData && Object.keys(responseData).length);
  if (!responseData || !hasData) {
    throw new Error(`Response parsing failed: ${responseData}`);
  }
  const ModelConstructor =
    (collection.constructor as typeof PureCollection).types.find(
      ({ type }) => type === response.type,
    ) || PureModel;

  // @ts-ignore
  const data: TResponse = overrideData || collection.add(responseData, ModelConstructor);
  return { value: data };
}

export class Response<
  TModel extends PureModel = PureModel,
  TResponse extends TModel | Array<TModel> = TModel | Array<TModel>,
> {
  public readonly included: Record<string, Response> = {};

  private __data: { value: TResponse | null } = { value: null };

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
      this.__data = initData<TModel, TResponse>(this.snapshot, this.collection);
    } catch (e) {
      this.__internal.error = e as Error;
    }
  }

  public get data(): TResponse | null {
    return this.__data.value;
  }

  public get error(): Array<string | Record<string, unknown>> | Error | undefined {
    return this.__internal.error;
  }

  public include(key: string, response: Response): void {
    this.included[key] = response;
  }
}
