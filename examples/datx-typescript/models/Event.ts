import { Model, Attribute } from '@datx/core';

import { Person } from './Person';

export class Event extends Model {
  public static type = 'event';

  @Attribute({ isIdentifier: true })
  public id: string;

  @Attribute()
  public title: string;

  @Attribute()
  public description: string;

  @Attribute()
  public date: Date;

  @Attribute({ toOne: Person })
  public responsible: Person;

  @Attribute({ toMany: Person })
  public organizers: Array<Person>;
}
