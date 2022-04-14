import { Model, Attribute } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Todo extends jsonapiModel(Model) {
  public static readonly type = 'todos';

  @Attribute({ isIdentifier: true })
  id!: number;

  @Attribute()
  message!: string;
}
