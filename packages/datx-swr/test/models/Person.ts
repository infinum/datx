import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Person extends jsonapiModel(PureModel) {
  public static readonly type = 'persons';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public name!: string;
}
