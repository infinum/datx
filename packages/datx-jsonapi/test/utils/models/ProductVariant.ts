import { IType, Model } from '@datx/core';

import { jsonapiModel } from '../../../src';

export class ProductVariant extends jsonapiModel(Model) {
  public static type: IType = 'product_variants';
}
