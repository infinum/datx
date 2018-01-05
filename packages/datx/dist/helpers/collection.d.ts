import { Collection } from '../Collection';
import { IRawModel } from '../interfaces/IRawModel';
import { IType } from '../interfaces/IType';
import { Model } from '../Model';
export declare function upsertModel(data: IRawModel, type: IType | typeof Model, collection: Collection): Model;
export declare function isSelectorFunction(fn: any): boolean;
export declare function initModels(collection: Collection, data: Array<IRawModel>): Model[];
