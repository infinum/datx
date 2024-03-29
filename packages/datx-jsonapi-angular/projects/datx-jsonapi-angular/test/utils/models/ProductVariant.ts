import { IType, Model } from '@datx/core';

import { jsonapiAngular } from '../../../src/public-api';

export class ProductVariant extends jsonapiAngular(Model) {
  public static type: IType = 'product_variants';
}
