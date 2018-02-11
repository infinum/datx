import {IModelConstructor, IType, Model, prop} from 'datx';
import {computed} from 'mobx';

import {IJsonapiModel, jsonapi} from '../../../src';
import {Image} from './Image';
import {User} from './User';

export class Organiser extends User {
  public static type: IType = 'organiser';

  @prop.toOne(Image) public image!: Image;
}
