import { FieldType } from '../../enums/FieldType';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { TRefValue } from '../../interfaces/TRefValue';
import { Model } from '../../Model';
export declare function getField(model: Model, key: string): any;
export declare function updateField(model: Model, key: string, value: any, type: FieldType): void;
export declare function getRef(model: Model, key: string): Model | Array<Model> | null;
export declare function updateRef(model: Model, key: string, value: TRefValue): void;
/**
 * Updates the model identifier and all the existing references to the model
 *
 * @export
 * @param {Model} model Model to be updated
 * @param {IIdentifier} newId New model identifier
 */
export declare function updateModelId(model: Model, newId: IIdentifier): void;
