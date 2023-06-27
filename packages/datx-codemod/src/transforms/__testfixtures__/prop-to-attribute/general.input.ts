// @ts-nocheck
/* eslint-disable */
import { Model, prop } from 'datx';

class Pet extends Model {
  public static type = 'pet';

  @prop
  public name!: string;

  @prop.identifier
  public id!: string;

  @prop.type
  public type!: string;

  @prop.defaultValue(0)
  public age: number;

  @prop.toOne(Person)
  public owner: Person;

  @prop.toOneOrMany(Person)
  public owners: Person | Person[];

  @prop.toMany(Person)
  public friends: Person[];

  @prop.toMany(Person, 'backProp')
  public friends2: Person[];
}
