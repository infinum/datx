import { Model } from '../Model';
import { ICollection } from './ICollection';
import { IRawModel } from './IRawModel';
export interface ICollectionConstructor {
    types: Array<typeof Model>;
    new (data?: Array<IRawModel>): ICollection;
}
