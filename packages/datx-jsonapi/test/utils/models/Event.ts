import {IActionsMixin, IMetaMixin, IModelConstructor, IType, Model, prop, PureModel} from 'datx';
import {IDictionary} from 'datx-utils';
import {computed} from 'mobx';

import {IJsonapiModel, jsonapi} from '../../../src';
import {Image} from './Image';
import {Organiser} from './Organiser';

export class Event extends jsonapi(Model) {
  public static type: IType = 'event';

  @prop public name!: string;
  @prop.toMany(Organiser) public organisers!: Array<Organiser>;
  @prop.toMany(Image) public images!: Array<Image>;
  @prop.toOne(Image) public image!: Image;
  @prop public imagesLinks!: IDictionary<string>;
}
