import { Model, Attribute } from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

import { Person } from './Person';

export class Event extends jsonapi(Model) {
  public static type = 'event';

  // If not given, the endpoint will be <baseUrl>/event

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
