import {Model, prop} from 'datx';

import {Event} from './Event';
import {Pet} from './Pet';

export class Person extends Model {
  public static type = 'person';

  @prop.identifier
  public id: string;

  @prop
  public name: string;

  @prop
  public age: number;

  @prop.toOne(Person)
  public spouse?: Person;

  @prop.toMany('pet', 'owner')
  public pets: Array<Pet>;

  @prop.toMany('event', 'responsible')
  public responsibleFor: Array<Event>;

  @prop.toMany('event', 'organizers')
  public organizing: Array<Event>;
}
