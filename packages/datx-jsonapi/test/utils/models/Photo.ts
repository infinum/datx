import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';

export class Photo extends jsonapi(Model) {
  public static type: IType = 'photo';

  @prop.defaultValue(false)
  public selected!: boolean;
}
