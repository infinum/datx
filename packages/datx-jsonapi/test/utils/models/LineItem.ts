import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';
import {
  Cart,
  // ProductVariant,
} from '../setup';

export class LineItem extends jsonapi(Model) {
  public static type: IType = 'line_items';

  @prop public title!: string;
  @prop.toOne(Cart) public cart!: Cart;
  // @prop.toOne(ProductVariant) public productVariant!: ProductVariant;
  // @prop.toOne(ProductVariant) public multitrackProductVariant!: ProductVariant;
}
