import { IActionsMixin } from '../interfaces/IActionsMixin';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { Model } from '../Model';
/**
 * Extends the model with some handy actions
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
export declare function withActions<T extends Model>(Base: IModelConstructor<T>): IModelConstructor<IActionsMixin<T> & T>;
