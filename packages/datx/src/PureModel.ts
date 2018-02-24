import {DEFAULT_TYPE, IDictionary, IRawModel} from 'datx-utils';

import {initModel} from './helpers/model/init';
import {IIdentifier} from './interfaces/IIdentifier';
import {IType} from './interfaces/IType';
import {PureCollection} from './PureCollection';

export class PureModel {

  /**
   * Model type used for serialization
   *
   * @static
   * @type {IType}
   * @memberof Model
   */
  public static type: IType = DEFAULT_TYPE;

  /**
   * Current autoincrement value used for automatic id generation
   *
   * @static
   * @type {IIdentifier}
   * @memberof Model
   */
  public static autoIdValue: IIdentifier = 0;

  public static enableAutoId: boolean = true;

  /**
   * Function used to preprocess the model input data. Called during the model initialization
   *
   * @static
   * @param {object} data Input data
   * @returns Target model data
   * @memberof Model
   */
  public static preprocess(data: object) {
    return data;
  }

  /**
   * Method used for generating of automatic model ids
   *
   * @static
   * @returns {IIdentifier} A new model id
   * @memberof Model
   */
  public static getAutoId(): IIdentifier {
    return typeof this.autoIdValue === 'number' ? --this.autoIdValue : this.autoIdValue;
  }

  public static toJSON() {
    return this.type;
  }

  constructor(rawData: IRawModel = {}, collection?: PureCollection) {
    initModel(this, rawData, collection);
  }
}
