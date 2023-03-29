import { IType, Model, prop } from '@datx/core';

import { jsonapiModel } from '../../../src';

export class Photo extends jsonapiModel(Model) {
  public static type: IType = 'photo';

  @prop.defaultValue(false)
  public selected!: boolean;
}
