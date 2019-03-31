import { IType, Model } from 'datx';

import { jsonapi } from '../../../src';

export class LineItem extends jsonapi(Model) {
  public static type: IType = 'line_items';
}
