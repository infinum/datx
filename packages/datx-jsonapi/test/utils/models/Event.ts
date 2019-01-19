import { IActionsMixin, IMetaMixin, IModelConstructor, IType, Model, prop, PureModel } from 'datx';
import { IDictionary } from 'datx-utils';

import { IJsonapiModel, jsonapi } from '../../../src';
import { Image } from './Image';
import { Organizer } from './Organizer';

export class Event extends jsonapi(Model) {
  public static type: IType = 'event';

  @prop public name!: string;
  @prop.toMany(Organizer) public organizers!: Array<Organizer>;
  @prop.toMany(Image) public images!: Array<Image>;
  @prop.toOne(Image) public image!: Image;
  @prop public imagesLinks!: IDictionary<string>;
}
