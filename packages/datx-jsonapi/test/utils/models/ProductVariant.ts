import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';
import { Product } from './Product';

export class ProductVariant extends jsonapi(Model) {
  public static type: IType = 'product_variants';

  @prop public title!: string;

  @prop.toOne('products')
  public product!: Product;

  @prop public multitrackProductType!: string;
}
