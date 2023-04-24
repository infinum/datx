import { Field, IType, Model } from '@datx/core';
import { mobx } from '@datx/utils';

import { jsonapiModel } from '../../../src';

export class User extends jsonapiModel(Model) {
  public static type: IType = 'user';

  @Field()
  public firstName!: string;

  @Field()
  public lastName!: string;

  @mobx.computed
  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
