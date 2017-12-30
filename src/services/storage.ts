import {computed, extendObservable, IObservableArray, observable, toJS} from 'mobx';

import {Collection} from '../Collection';
import {getModelId, getModelType} from '../helpers/model';
import {IDataStorage} from '../interfaces/IDataStorage';
import {IDictionary} from '../interfaces/IDictionary';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';

export class DataStorage {
  private modelData = new WeakMap<Model, IDataStorage>();
  private modelClassDefaults = new WeakMap<typeof Model, IDictionary<any>>();
  private modelClassReferences = new WeakMap<typeof Model, IDictionary<IReferenceOptions>>();
  private collections: IObservableArray<Collection> = observable.array([]);

  @computed private get models(): IDictionary<IDictionary<Model>> {
    const modelHash = {};

    this.collections.forEach((collection) => {
      collection.findAll().forEach((model) => {
        const id = getModelId(model);
        const type = getModelType(model);

        modelHash[type] = modelHash[type] || [];
        modelHash[type][id] = modelHash[type][id] || model;
      });
    });

    return modelHash;
  }

  public initModel(model: Model) {
    const modelData = {data: {}, meta: {}};
    extendObservable(modelData);
    this.modelData.set(model, modelData);
    return modelData;
  }

  public getModelData(model: Model) {
    return this.__getModelData(model).data;
  }

  public getModelDataKey(model: Model, key: string) {
    const modelData = this.__getModelData(model);
    return modelData.data[key];
  }

  public setModelData(model: Model, data: IDictionary<any>) {
    const modelData = this.__getModelData(model);
    extendObservable(modelData.data, data);
  }

  public setModelDataKey(model: Model, key: string, value?: any) {
    this.setModelData(model, {[key]: value});
  }

  public getModelMeta(model: Model): IDictionary<any>|null {
    const modelData = this.modelData.get(model);
    return modelData ? modelData.meta : null;
  }

  public getModelMetaKey(model: Model, key: string): any {
    const modelData = this.modelData.get(model);
    const meta = modelData ? modelData.meta : null;
    return meta ? meta[key] : undefined;
  }

  public setModelMeta(model: Model, meta: IDictionary<any>) {
    const modelData = this.__getModelData(model);
    extendObservable(modelData.meta, meta);
    return modelData.meta;
  }

  public addModelDefaultField(model: typeof Model, key: string, value?: any) {
    if (this.modelClassDefaults.has(model)) {
      Object.assign(this.modelClassDefaults.get(model), {[key]: value});
    } else {
      this.modelClassDefaults.set(model, {[key]: value});
    }
  }

  public getModelDefaults(obj: typeof Model): IDictionary<any> {
    const defaults: Array<IDictionary<any>> = [];
    let model = obj;
    while (model) {
      defaults.push(this.modelClassDefaults.get(model) || {});
      model = Object.getPrototypeOf(model);
    }
    return Object.assign({}, ...defaults.reverse());
  }

  public registerCollection(collection: Collection) {
    this.collections.push(collection);
  }

  public unregisterCollection(collection: Collection) {
    this.collections.remove(collection);
  }

  public getModelCollections(model: Model): Array<Collection> {
    return this.collections.filter((item) => item.hasItem(model));
  }

  public findModel(model: IType|typeof Model|Model, id: IIdentifier): Model|null {
    const type = getModelType(model);
    if (type in this.models && id in this.models[type]) {
      return this.models[type][id];
    }
    return null;
  }

  public addModelClassReference(model: typeof Model, key: string, options: IReferenceOptions) {
    const references = this.modelClassReferences.get(model);
    if (references) {
      Object.assign(references, {[key]: options});
    } else {
      this.modelClassReferences.set(model, {[key]: options});
    }
  }

  public getModelClassReferences(model: typeof Model): IDictionary<IReferenceOptions> {
    return this.modelClassReferences.get(model) || {};
  }

  public getModelsByType(type: IType) {
    return this.models[type];
  }

  public isInCollection(model: IType|typeof Model, id: Model|IIdentifier|null) {
    if (id === null) {
      return false;
    }

    const type = getModelType(model);
    return type in this.models && getModelId(id) in this.models[type];
  }

  private __getModelData(model: Model): IDataStorage {
    return this.modelData.get(model) || this.initModel(model);
  }

  // For testing purposes only
  private clear() {
    this.modelData = new WeakMap<Model, IDataStorage>();
    this.modelClassDefaults = new WeakMap<typeof Model, IDictionary<any>>();
    this.modelClassReferences = new WeakMap<typeof Model, IDictionary<IReferenceOptions>>();
    this.collections.replace([]);
  }
}

export const storage = new DataStorage();
