import {extendObservable, IObservableArray, observable} from 'mobx';

import {Collection} from '../Collection';
import {IDataStorage} from '../interfaces/IDataStorage';
import {IDictionary} from '../interfaces/IDictionary';
import {Model} from '../Model';

export class DataStorage {
  private modelData = new Map<Model, IDataStorage>();
  private modelDefaults = new Map<typeof Model, IDictionary<any>>();
  private collections: Array<Collection> = observable.array([]);

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
  }

  public addModelDefaultField(model: typeof Model, key: string, value?: any) {
    if (this.modelDefaults.has(model)) {
      Object.assign(this.modelDefaults.get(model), {[key]: value});
    } else {
      this.modelDefaults.set(model, {[key]: value});
    }
  }

  public getModelDefaults(obj: typeof Model): IDictionary<any> {
    const defaults: Array<IDictionary<any>> = [];
    let model = obj;
    while (model) {
      defaults.push(this.modelDefaults.get(model) || {});
      model = Object.getPrototypeOf(model);
    }
    return Object.assign({}, ...defaults.reverse());
  }

  public registerCollection(collection: Collection) {
    this.collections.push(collection);
  }

  public getModelCollections(model: Model): Array<Collection> {
    return this.collections.filter((item) => item.hasItem(model));
  }

  private __getModelData(model: Model): IDataStorage {
    return this.modelData.get(model) || this.initModel(model);
  }
}

export const storage = new DataStorage();
