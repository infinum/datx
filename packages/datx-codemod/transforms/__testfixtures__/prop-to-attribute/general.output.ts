// @ts-nocheck
/* eslint-disable */
import { Model, Attribute } from '@datx/core';

class Pet extends Model {
  @Attribute()
  public name!: string;

  @Attribute({ isIdentifier: true })
  public id!: string;

  @Attribute({ isType: true })
  public type!: string;

  @Attribute({ defaultValue: 0 })
  public age: number;

  @Attribute({ toOne: Person })
  public owner: Person;

  @Attribute({ toOneOrMany: Person })
  public owners: Person | Person[];

  @Attribute({ toMany: Person })
  public friends: Person[];

  @Attribute({ toMany: Person, referenceProperty: 'backProp' })
  public friends2: Person[];
}
