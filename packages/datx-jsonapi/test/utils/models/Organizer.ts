import { IModelConstructor, IType, Model, prop } from 'datx';

import { IJsonapiModel, jsonapi } from '../../../src';
import { Image } from './Image';
import { User } from './User';

export class Organizer extends User {
  public static type: IType = 'organizers';

  @prop.toOne(Image) public image!: Image;
}
