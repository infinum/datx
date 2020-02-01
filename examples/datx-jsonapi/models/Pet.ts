import { Model, prop } from 'datx';
import { jsonapi } from 'datx-jsonapi';

import { Person } from './Person';

export class Pet extends jsonapi(Model) {
  public static type = 'pet';

  // Endpoint can be dynamic - the function is called every time
  public static endpoint = () => 'pets';

  @prop.identifier
  public id: string;

  @prop
  public name: string;

  @prop
  public age: number;

  @prop.toOne(Person)
  public owner: Person;
}
