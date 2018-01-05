import { Collection } from '../../Collection';
import { IDictionary } from '../../interfaces/IDictionary';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { IRawModel } from '../../interfaces/IRawModel';
import { IType } from '../../interfaces/IType';
import { Model } from '../../Model';
/**
 * Get the model type
 *
 * @export
 * @param {(IType|typeof Model|Model)} model Model to be checked
 * @returns {IType} Model type
 */
export declare function getModelType(model: IType | typeof Model | Model): IType;
/**
 * Get the model identifier
 *
 * @export
 * @param {(Model|IIdentifier)} model Model to be checked
 * @returns {IIdentifier} Model identifier
 */
export declare function getModelId(model: Model | IIdentifier): IIdentifier;
/**
 * Get a list of collections the given model belongs to
 *
 * @export
 * @param {Model} model Model to be checked
 * @returns {Array<Collection>} A list of collections the given model belongs to
 */
export declare function getModelCollections(model: Model): Array<Collection>;
/**
 * Clone the given model
 *
 * @export
 * @template T
 * @param {T} model Model to be clones
 * @returns {T} Cloned model object
 */
export declare function cloneModel<T extends Model>(model: T): T;
/**
 * Get the original model for the cloned model
 *
 * @export
 * @param {Model} model Cloned model
 * @returns {Model} Original model
 */
export declare function getOriginalModel(model: Model): Model;
/**
 * Bulk update the model data
 *
 * @export
 * @template T
 * @param {T} model Model to be updated
 * @param {IDictionary<any>} data Data that should be assigned to the model
 * @returns {T}
 */
export declare function updateModel<T extends Model>(model: T, data: IDictionary<any>): T;
/**
 * Assign a property to a model
 *
 * @export
 * @template T
 * @param {T} model A model to modify
 * @param {string} key Property name
 * @param {*} value Property value
 */
export declare function assignModel<T extends Model>(model: T, key: string, value: any): void;
export declare function getMetaKeyFromRaw(data: IRawModel, key: string): any;
/**
 * Get a serializable value of the model
 *
 * @export
 * @param {Model} model Model to serialize
 * @returns {IRawModel} Pure JS value of the model
 */
export declare function modelToJSON(model: Model): IRawModel;
