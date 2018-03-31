import {Model, prop} from 'datx';
import {jsonapi} from 'datx-jsonapi';

import {Person} from './Person';

export class Event extends jsonapi(Model) {
  public static type = 'event';

  // If not given, the endpoint will be <baseUrl>/event

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
