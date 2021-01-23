import { Model, Attribute } from '@datx/core';

import { Event } from './Event';
import { Pet } from './Pet';

export class Person extends Model {
  public static type = 'person';

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
