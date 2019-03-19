import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';
import { ProductVariant } from './ProductVariant';

export class LineItem extends jsonapi(Model) {
  public static type: IType = 'line_items';

  @prop.toOne(ProductVariant) public productVariant!: ProductVariant;
  @prop.toOne(ProductVariant) public multitrackProductVariant!: ProductVariant;
}
