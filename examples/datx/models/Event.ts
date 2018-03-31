import {Model, prop} from 'datx';

import {Person} from './Person';

export class Event extends Model {
  public static type = 'event';

  @prop.identifier
  public id: string;

  @prop
  public title: string;

  @prop
  public description: string;

  @prop
  public date: Date;

  @prop.toOne(Person)
  public responsible: Person;

  @prop.toMany(Person)
  public organizers: Array<Person>;
}
