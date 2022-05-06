import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Todo extends jsonapiModel(PureModel) {
  public static readonly type = 'todos';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public message!: string;
}
