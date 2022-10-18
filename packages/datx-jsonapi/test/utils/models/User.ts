import { IType, Model, prop } from '@datx/core';

import { jsonapi } from '../../../src';

export class User extends jsonapi(Model) {
  public static type: IType = 'user';

  @prop
  public firstName!: string;

  @prop
  public lastName!: string;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
