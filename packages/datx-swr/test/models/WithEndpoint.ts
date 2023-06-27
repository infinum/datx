import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class WithEndpoint extends jsonapiModel(PureModel) {
  public static readonly type = 'withEndpoint';
  public static readonly endpoint = 'with-endpoint';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public name!: string;
}
