import { IType, Model } from '@datx/core';

import { jsonapiAngular } from '../../../src';

export class LineItem extends jsonapiAngular(Model) {
  public static type: IType = 'line_items';
}
