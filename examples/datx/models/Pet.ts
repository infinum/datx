import { Model, Attribute } from '@datx/core';

import { Person } from './Person';

export class Pet extends Model {
  public static type = 'pet';

  @Attribute({ isIdentifier: true })
  public id: string;

  @Attribute()
  public name: string;

  @Attribute()
  public age: number;

  @Attribute({ toOne: Person })
  public owner: Person;
}
