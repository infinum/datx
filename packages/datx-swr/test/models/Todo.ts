import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';
import { Person } from './Person';

export class Todo extends jsonapiModel(PureModel) {
  public static readonly type = 'todos';

  @Attribute({ isIdentifier: true })
  public id!: number;

  @Attribute()
  public message!: string;

  @Attribute({ toOne: () => Person })
  public author!: Person;
}
