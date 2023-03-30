import { IType, Model, prop } from '@datx/core';
import { mobx } from '@datx/utils';

import { jsonapiModel } from '../../../src';

export class User extends jsonapiModel(Model) {
  public static type: IType = 'user';

  @prop
  public firstName!: string;

  @prop
  public lastName!: string;

  @mobx.computed
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
