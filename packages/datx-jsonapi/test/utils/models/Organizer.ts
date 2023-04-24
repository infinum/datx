import { IType, Field } from '@datx/core';

import { Image } from './Image';
import { User } from './User';

export class Organizer extends User {
  public static type: IType = 'organizers';

  @Field({ toOne: Image })
  public image!: Image;
}
