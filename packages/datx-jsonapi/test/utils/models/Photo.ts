import { IType, Model, Field } from '@datx/core';

import { jsonapiModel } from '../../../src';

export class Photo extends jsonapiModel(Model) {
  public static type: IType = 'photo';

  @Field({ defaultValue: false })
  public selected!: boolean;
}
