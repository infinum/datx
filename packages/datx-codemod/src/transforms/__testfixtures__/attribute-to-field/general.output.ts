// @ts-nocheck
/* eslint-disable */
import { Model, Field } from '@datx/core';

class Pet extends Model {
  public static type = 'pet';

  @Field()
  public name!: string;

  @Field({
    isIdentifier: true,
  })
  public id!: string;

  @Field({
    isType: true,
  })
  public type!: string;

  @Field({
    defaultValue: 0,
  })
  public age: number;

  @Field({
    toOne: Person,
  })
  public owner: Person;

  @Field({
    toOneOrMany: Person,
  })
  public owners: Person | Person[];

  @Field({
    toMany: Person,
  })
  public friends: Person[];

  @Field({
    toMany: Person,
    referenceProperty: 'backProp',
  })
  public friends2: Person[];
}
