import { Collection, PureModel } from '@datx/core';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';

export class Response<
  TModel extends PureModel = PureModel,
  TResponse extends TModel | Array<TModel> = TModel | Array<TModel>,
> {
  public readonly included: Record<string, Response> = {};

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

  public include(key: string, response: Response): void {
    this.included[key] = response;
  }
}
