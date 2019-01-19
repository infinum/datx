import { IActionsMixin, IMetaMixin, IModelConstructor, IType, Model, prop, PureModel } from 'datx';
import { computed } from 'mobx';

import { IJsonapiModel, jsonapi } from '../../../src';

export class User extends jsonapi(Model) {
  public static type: IType = 'user';

  @prop public firstName!: string;
  @prop public lastName!: string;

  @computed get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
