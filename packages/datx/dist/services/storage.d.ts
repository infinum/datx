import { Collection } from '../Collection';
import { IDictionary } from '../interfaces/IDictionary';
import { IIdentifier } from '../interfaces/IIdentifier';
import { IReferenceOptions } from '../interfaces/IReferenceOptions';
import { IType } from '../interfaces/IType';
import { Model } from '../Model';
export declare class DataStorage {
    private modelData;
    private modelClassData;
    private collections;
    initModel(model: Model): {
        data: {};
        meta: {};
    };
    getModelData(model: Model): IDictionary<any>;
    getModelDataKey(model: Model, key: string): any;
    setModelData(model: Model, data: IDictionary<any>): void;
    setModelDataKey(model: Model, key: string, value?: any): void;
    getModelMeta(model: Model): IDictionary<any>;
    getModelMetaKey(model: Model, key: string): any;
    setModelMeta(model: Model, meta: IDictionary<any>): IDictionary<any>;
    setModelMetaKey(model: Model, key: string, value?: any): void;
    getAllModels(): Model[];
    setModelClassMetaKey(model: typeof Model, key: string, value?: any): void;
    getModelClassMetaKey(obj: typeof Model, key: string): any;
    addModelDefaultField(model: typeof Model, key: string, value?: any): void;
    getModelDefaults(obj: typeof Model): IDictionary<any>;
    registerCollection(collection: Collection): void;
    unregisterCollection(collection: Collection): void;
    getModelCollections(model: Model): Array<Collection>;
    findModel(model: IType | typeof Model | Model, modelId: Model | IIdentifier | null): Model | null;
    addModelClassReference(model: typeof Model, key: string, options: IReferenceOptions): void;
    getModelClassReferences(obj: typeof Model): IDictionary<IReferenceOptions>;
    getModelReferenceOptions(model: Model, key: string): IReferenceOptions;
    getModelsByType(type: IType): Model[];
    private __getModelData(model);
    private clear();
}
export declare const storage: DataStorage;
