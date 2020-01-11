import { DEFAULT_TYPE, IRawModel, META_FIELD } from 'datx-utils';
import { extendObservable } from 'mobx';

import { PureCollection } from './PureCollection';
import { initModel } from './helpers/model/init';
import { IIdentifier } from './interfaces/IIdentifier';
import { IType } from './interfaces/IType';
import { modelToJSON } from './helpers/model/utils';

export class PureModel {
  public static type: string = DEFAULT_TYPE;

  public static autoIdValue: IIdentifier = 0;
  public static enableAutoId: boolean = true;

  public static getAutoId(): IIdentifier {
    return typeof this.autoIdValue === 'number' ? --this.autoIdValue : this.autoIdValue;
  }

  public static toJSON(): IType {
    return this.type;
  }

  constructor(rawData: IRawModel = {}, collection?: PureCollection) {
    extendObservable(this, {});
    initModel(this, rawData, collection);
  }

  public valueOf() {
    const { [META_FIELD]: _, ...data } = modelToJSON(this);
    return data;
  }
}
