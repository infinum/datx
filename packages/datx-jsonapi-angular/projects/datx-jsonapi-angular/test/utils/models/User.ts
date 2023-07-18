import { IType, Model, prop } from '@datx/core';

import { jsonapiAngular } from '../../../src/public-api';

export class User extends jsonapiAngular(Model) {
  public static type: IType = 'user';

  @prop
  public firstName!: string;

  @prop
  public lastName!: string;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
