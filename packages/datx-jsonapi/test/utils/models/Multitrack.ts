import { IType, Model, prop } from 'datx';
import { IDictionary } from 'datx-utils';
import { computed } from 'mobx';

import { jsonapi } from '../../../src';
import { ProductVariant } from './ProductVariant';

const multitrackTypePriority: IDictionary<number> = {
  ['prime_only']: 0,
  ['prime_and_zip']: 1,
};

export class Multitrack extends jsonapi(Model) {
  public static type: IType = 'multitracks';

  @prop public title!: string;
  @prop.toMany('product_variants') public productVariants!: Array<ProductVariant>;

  @computed
  public get typeSortedVariants(): Array<ProductVariant> {
    return this.productVariants.sort((a, b) => (
      multitrackTypePriority[a.multitrackProductType] - multitrackTypePriority[b.multitrackProductType]
    ));
  }
}
