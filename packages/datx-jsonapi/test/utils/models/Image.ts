import { Field, IType, Model } from '@datx/core';
import { mobx } from '@datx/utils';

import { jsonapiModel } from '../../../src';
import { Event } from './Event';

export class Image extends jsonapiModel(Model) {
  public static type: IType = 'image';

  @Field()
  public name!: string;

  @Field({ toOne: 'event' })
  public event!: Event;

  @mobx.computed
  public get id(): string {
    return this.meta.id.toString();
  }
}
