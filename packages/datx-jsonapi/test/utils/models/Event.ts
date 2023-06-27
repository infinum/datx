import { IType, Model, Field } from '@datx/core';

import { jsonapiModel } from '../../../src';
import { Image } from './Image';
import { Organizer } from './Organizer';

export class Event extends jsonapiModel(Model) {
  public static type: IType = 'event';

  @Field({ isIdentifier: true })
  public id!: string;

  @Field()
  public name!: string;

  @Field()
  public title!: string;

  @Field({ toMany: Organizer })
  public organizers!: Array<Organizer>;

  @Field({ toMany: Image })
  public images!: Array<Image>;

  @Field({ toOne: Image })
  public image!: Image;

  @Field()
  public imagesLinks!: Record<string, string>;
}
