import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';
import { ProductVariant } from './ProductVariant';

export class Multitrack extends jsonapi(Model) {
  public static type: IType = 'multitracks';

  @prop public title!: string;
  @prop.toMany(ProductVariant) public productVariant!: Array<ProductVariant>;
}
