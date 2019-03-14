import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';

export class Cart extends jsonapi(Model) {
  public static type: IType = 'carts';

  @prop public title!: string;
}
