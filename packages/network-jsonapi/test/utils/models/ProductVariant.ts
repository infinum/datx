import { IType, Model } from '@datx/core';

import { jsonapi } from '../../../src';

export class ProductVariant extends jsonapi(Model) {
  public static type: IType = 'product_variants';
}
