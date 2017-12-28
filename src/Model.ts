import {DEFAULT_TYPE} from './consts';
import {initModel} from './helpers/model';
import {IDictionary} from './interfaces/IDictionary';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';

export class Model {
  public static type: IType = DEFAULT_TYPE;
  public static autoIdValue: number = 0;

  public static preprocess(data: object) {
    return data;
  }

  public static getAutoId() {
    return --this.autoIdValue;
  }

  private static __defaults: IDictionary<any> = {};

  constructor(rawData: IRawModel = {}) {
    initModel(this, rawData);
  }
}
