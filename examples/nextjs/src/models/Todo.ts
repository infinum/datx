import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Todo extends jsonapiModel(PureModel) {
  public static readonly type = 'todos';

  @Attribute({ isIdentifier: true })
  id!: number;

  @Attribute()
  message!: string;
}
