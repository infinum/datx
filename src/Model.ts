import {DEFAULT_TYPE} from './consts';
import {initModel} from './helpers/model/init';
import {IDictionary} from './interfaces/IDictionary';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';

export class Model {

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
   * @type {number}
   * @memberof Model
   */
  public static autoIdValue: number = 0;

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
  public static getAutoId() {
    return --this.autoIdValue;
  }

  constructor(rawData: IRawModel = {}) {
    initModel(this, rawData);
  }
}
