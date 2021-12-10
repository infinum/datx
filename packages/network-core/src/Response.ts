import { Collection, PureModel } from '@datx/core';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';

export class Response<
  TResponse extends TModel | Array<TModel>,
  TModel extends PureModel = PureModel,
> {
  private _data: TResponse | null;
  constructor(
    public readonly snapshot: IResponseSnapshot,
    private readonly collection?: Collection,
  ) {
    this._data = (this.collection?.add(snapshot.response) as TResponse) ?? null;
  }

  public get data(): TResponse | null {
    return this._data;
  }
}
