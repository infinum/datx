import { Collection } from '../../Collection';
import { FieldType } from '../../enums/FieldType';
import { IRawModel } from '../../interfaces/IRawModel';
import { IReferenceOptions } from '../../interfaces/IReferenceOptions';
import { TRefValue } from '../../interfaces/TRefValue';
import { Model } from '../../Model';
export declare function initModelField<T extends Model>(obj: T, key: string, defValue: any, type?: FieldType): void;
/**
 * Initialize a reference to other models
 *
 * @export
 * @template T
 * @param {T} obj Model to which the reference should be added
 * @param {string} key Model property where the reference will be defined
 * @param {IReferenceOptions} options Reference options
 * @param {TRefValue} initialVal Initial reference value
 */
export declare function initModelRef<T extends Model>(obj: T, key: string, options: IReferenceOptions, initialVal: TRefValue): void;
export declare function initModel(model: Model, rawData: IRawModel, collection?: Collection): void;
