import { IType, Model, prop } from '@datx/core';

import { jsonapiModel } from '../../../src';
import { Image } from './Image';
import { Organizer } from './Organizer';

export class Event extends jsonapiModel(Model) {
  public static type: IType = 'event';

  @prop.identifier
  public id!: string;

  @prop
  public name!: string;

  @prop
  public title!: string;

  @prop.toMany(Organizer)
  public organizers!: Array<Organizer>;

  @prop.toMany(Image)
  public images!: Array<Image>;

  @prop.toOne(Image)
  public image!: Image;

  @prop
  public imagesLinks!: Record<string, string>;
}
