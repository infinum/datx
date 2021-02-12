import { IType, Model, prop } from '@datx/core';
import { mobx } from '@datx/utils';

import { jsonapiAngular } from '../../../src';

export class User extends jsonapiAngular(Model) {
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
