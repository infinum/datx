import {IActionsMixin, IMetaMixin, IModelConstructor, IType, Model, prop, PureModel} from 'datx';

import {IJsonapiModel, jsonapi} from '../../../src';
import {Event} from './Event';

export class Image extends jsonapi(Model) {
  public static type: IType = 'image';

  @prop public name!: string;
  @prop.toOne('events') public event!: Event;
}
