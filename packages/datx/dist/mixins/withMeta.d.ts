import { IMetaMixin } from '../interfaces/IMetaMixin';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { Model } from '../Model';
/**
 * Extends the model with the exposed meta data
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
export declare function withMeta<T extends Model>(Base: IModelConstructor<T>): IModelConstructor<IMetaMixin<T> & T>;
