import { IType, Model, prop } from '@datx/core';

import { jsonapiAngular } from '../../../src/public-api';

export class Photo extends jsonapiAngular(Model) {
  public static type: IType = 'photo';

  @prop.defaultValue(false)
  public selected!: boolean;
}
