import { IType, prop } from 'datx';

import { Image } from './Image';
import { User } from './User';

export class Organizer extends User {
  public static type: IType = 'organizers';

  @prop.toOne(Image)
  public image!: Image;
}
