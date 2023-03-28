import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';
import { Todo } from './Todo';

export class TodoList extends jsonapiModel(PureModel) {
  public static readonly type = 'todo-lists';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public name!: string;

  @Attribute({ toMany: () => Todo })
  public todos!: Array<Todo>;
}
