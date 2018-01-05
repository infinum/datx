import { Collection } from './Collection';
import { IRawModel } from './interfaces/IRawModel';
import { IType } from './interfaces/IType';
export declare class Model {
    /**
     * Model type used for serialization
     *
     * @static
     * @type {IType}
     * @memberof Model
     */
    static type: IType;
    /**
     * Current autoincrement value used for automatic id generation
     *
     * @static
     * @type {number}
     * @memberof Model
     */
    static autoIdValue: number;
    /**
     * Function used to preprocess the model input data. Called during the model initialization
     *
     * @static
     * @param {object} data Input data
     * @returns Target model data
     * @memberof Model
     */
    static preprocess(data: object): object;
    /**
     * Method used for generating of automatic model ids
     *
     * @static
     * @returns {IIdentifier} A new model id
     * @memberof Model
     */
    static getAutoId(): number;
    constructor(rawData?: IRawModel, collection?: Collection);
}
