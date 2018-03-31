import {Model, prop} from 'datx';

import {Person} from './Person';

export class Pet extends Model {
  public static type = 'pet';

  @prop.identifier
  public id: string;

  @prop
  public name: string;

  @prop
  public age: number;

  @prop.toOne(Person)
  public owner: Person;
}
