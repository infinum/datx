import { Collection } from '../Collection';
import { IIdentifier } from '../interfaces/IIdentifier';
import { IType } from '../interfaces/IType';
import { Model } from '../Model';
export interface IMetaMixin<T = Model> {
    meta: {
        collections: Array<Collection>;
        id: IIdentifier;
        original?: T;
        type: IType;
    };
}
