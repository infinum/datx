import { Model, Attribute } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

import { Event } from './Event';
import { Pet } from './Pet';

export class Person extends jsonapi(Model) {
  public static type = 'person';

  public static endpoint = 'people'; // <baseUrl>/people

  @Attribute({ isIdentifier: true })
  public id: string;

  @Attribute()
  public name: string;

  @Attribute()
  public age: number;

  @Attribute({ toOne: Person })
  public spouse?: Person;

  @Attribute({ toMany: 'pet', referenceProperty: 'owner' })
  public pets: Array<Pet>;

  @Attribute({ toMany: 'event', referenceProperty: 'responsible' })
  public responsibleFor: Array<Event>;

  @Attribute({ toMany: 'event', referenceProperty: 'organizers' })
  public organizing: Array<Event>;
}
