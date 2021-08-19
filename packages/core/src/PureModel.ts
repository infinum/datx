import { DEFAULT_TYPE, IRawModel } from '@datx/utils';

import { PureCollection } from './PureCollection';
import { initModel } from './helpers/model/init';
import { IIdentifier } from './interfaces/IIdentifier';
import { IType } from './interfaces/IType';
import { startAction, endAction } from './helpers/patch';
import { PatchType } from './enums/PatchType';

export class PureModel {
  public static type: IType = DEFAULT_TYPE;

  public static autoIdValue: IIdentifier = 0;

  public static enableAutoId = true;

  public static preprocess(data: Record<string, unknown>): Record<string, unknown> {
    return data;
  }

  public static getAutoId(): IIdentifier {
    return typeof this.autoIdValue === 'number' ? --this.autoIdValue : this.autoIdValue;
  }

  public static toJSON(): IType {
    return this.type;
  }

  constructor(rawData: IRawModel = {}, collection?: PureCollection) {
    startAction(this);
    initModel(this, rawData, collection);
    endAction(this, PatchType.CRATE);
  }
}
