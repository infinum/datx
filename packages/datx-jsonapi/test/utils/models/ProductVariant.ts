import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';
import { Product } from './Product';

export class ProductVariant extends jsonapi(Model) {
  public static type: IType = 'product_variants';

  @prop public title!: string;
  @prop.toOne(Product) public product!: Product;
}
