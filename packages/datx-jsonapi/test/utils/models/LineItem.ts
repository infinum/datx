import { IType, Model } from '@datx/core';

import { jsonapiModel } from '../../../src';

export class LineItem extends jsonapiModel(Model) {
  public static type: IType = 'line_items';
}
