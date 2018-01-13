import {computed, extendObservable, IObservableArray, observable, toJS} from 'mobx';

import {Collection} from '../Collection';
import {getModelId, getModelType} from '../helpers/model/utils';
import {reducePrototypeChain} from '../helpers/selectors';
import {flatten, uniq} from '../helpers/utils';
import {IDataStorage} from '../interfaces/IDataStorage';
import {IDictionary} from '../interfaces/IDictionary';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';

interface IModelClassData {
  data: IDictionary<any>;
  meta: IDictionary<any>;
  references: IDictionary<IReferenceOptions>;
}

export class DataStorage {
  private modelData = new WeakMap<Model, IDataStorage>();

  private modelClassData = new WeakMap<typeof Model, IModelClassData>();

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

  public getModelMeta(model: Model): IDictionary<any> {
    return (this.modelData.get(model) as IDataStorage).meta;
  }

  public getModelMetaKey(model: Model, key: string): any {
    return this.getModelMeta(model)[key];
  }

  public setModelMeta(model: Model, meta: IDictionary<any>) {
    const modelData = this.__getModelData(model);
    extendObservable(modelData.meta, meta);
    return modelData.meta;
  }

  public setModelMetaKey(model: Model, key: string, value?: any) {
    this.setModelMeta(model, {[key]: value});
  }

  public setModelClassMetaKey(model: typeof Model, key: string, value?: any) {
    const data = this.modelClassData.get(model) as IModelClassData;
    Object.assign(data.meta, {[key]: value});
  }

  public getModelClassMetaKey(obj: typeof Model, key: string): any {
    return reducePrototypeChain(obj, (value, model) => {
      return value || (this.modelClassData.get(model) || {meta: {}}).meta[key] || null;
    }, null);
  }

  public addModelDefaultField(model: typeof Model, key: string, value?: any) {
    const data = this.modelClassData.get(model);
    if (data) {
      Object.assign(data.data, {[key]: value});
    } else {
      this.modelClassData.set(model, {
        data: {[key]: value},
        meta: {},
        references: {},
      });
    }
  }

  public getModelDefaults(obj: typeof Model): IDictionary<any> {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((this.modelClassData.get(model) || {data: []}).data);
    }, [] as Array<IDictionary<any>>);
    return Object.assign({}, ...defaults.reverse());
  }

  public addModelClassReference(model: typeof Model, key: string, options: IReferenceOptions) {
    const data = this.modelClassData.get(model);
    if (data) {
      Object.assign(data.references, {[key]: options});
    } else {
      this.modelClassData.set(model, {
        data: {},
        meta: {},
        references: {[key]: options},
      });
    }
  }

  public getModelClassReferences(obj: typeof Model): IDictionary<IReferenceOptions> {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((this.modelClassData.get(model) || {references: {}}).references);
    }, [] as Array<IDictionary<any>>);
    return Object.assign({}, ...defaults.reverse());
  }

  public getModelReferenceOptions(model: Model, key: string): IReferenceOptions {
    const refs = this.getModelMetaKey(model, 'refs');
    return refs[key];
  }

  private __getModelData(model: Model): IDataStorage {
    return this.modelData.get(model) || this.initModel(model);
  }

  // For testing purposes only
  private clear() {
    this.modelData = new WeakMap<Model, IDataStorage>();
    this.modelClassData = new WeakMap<typeof Model, IModelClassData>();
  }
}

export const storage = new DataStorage();
