import { Field, IType, Model } from '@datx/core';

import { jsonapiModel } from '../../../src';
import { Event } from './Event';

export class Image extends jsonapiModel(Model) {
  public static type: IType = 'image';

  @Field()
  public name!: string;

  @Field({ toOne: 'event' })
  public event!: Event;

  public get id(): string {
    return this.meta.id.toString();
  }
}
