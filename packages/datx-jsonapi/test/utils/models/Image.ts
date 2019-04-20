import { IType, Model, prop } from 'datx';
import { computed } from 'mobx';

import { jsonapi } from '../../../src';
import { Event } from './Event';

export class Image extends jsonapi(Model) {
  public static type: IType = 'image';

  @prop public name!: string;
  @prop.toOne('event') public event!: Event;

  @computed get id(): string {
    return this.meta.id.toString();
  }
}
