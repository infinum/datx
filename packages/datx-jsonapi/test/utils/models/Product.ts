import { IType, Model, prop } from 'datx';

import { jsonapi } from '../../../src';
// import { ProductVariant } from '../setup';

export class Product extends jsonapi(Model) {
  public static type: IType = 'products';

  @prop public title!: string;
  // @prop.toMany(ProductVariant) public multitrackVariants!: Array<ProductVariant>;
}
