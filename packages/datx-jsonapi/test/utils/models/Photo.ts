import {IActionsMixin, IMetaMixin, IModelConstructor, IType, Model, prop, PureModel} from 'datx';

import {IJsonapiModel, jsonapi} from '../../../src';

export class Photo extends jsonapi(Model) {
  public static type: IType = 'photo';

  @prop.defaultValue(false) public selected!: boolean;
}
