import { Model, Attribute } from 'datx';
import { jsonapi } from 'datx-jsonapi';

import { Person } from './Person';

export class Pet extends jsonapi(Model) {
  public static type = 'pet';

  // Endpoint can be dynamic - the function is called every time
  public static endpoint = () => 'pets';

  @Attribute({ isIdentifier: true })
  public id: string;

  @Attribute()
  public name: string;

  @Attribute()
  public age: number;

  @Attribute({ toOne: Person })
  public owner: Person;
}
