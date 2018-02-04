import {flatten, IDictionary, uniq} from 'datx-utils';
import {computed, extendObservable, IObservableArray, observable, toJS} from 'mobx';

import {getModelId, getModelType} from '../helpers/model/utils';
import {reducePrototypeChain} from '../helpers/selectors';
import {IDataStorage} from '../interfaces/IDataStorage';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';

interface IModelClassData {
  data: IDictionary<any>;
  meta: IDictionary<any>;
  references: IDictionary<IReferenceOptions>;
}

export class DataStorage {
  private modelData = new WeakMap<PureModel, IDataStorage>();

  private modelClassData = new WeakMap<typeof PureModel|{type: IType}, IModelClassData>();

  public initModel(model: PureModel) {
    const modelData = {data: {}, meta: {}};
    extendObservable(modelData);
    this.modelData.set(model, modelData);
    return modelData;
  }

  public getModelData(model: PureModel) {
    return this.__getModelData(model).data;
  }

  public getModelDataKey(model: PureModel, key: string) {
    const modelData = this.__getModelData(model);
    return modelData.data[key];
  }

  public setModelData(model: PureModel, data: IDictionary<any>) {
    const modelData = this.__getModelData(model);
    extendObservable(modelData.data, data);
  }

  public setModelDataKey(model: PureModel, key: string, value?: any) {
    this.setModelData(model, {[key]: value});
  }

  public getModelMeta(model: PureModel): IDictionary<any> {
    return (this.modelData.get(model) as IDataStorage).meta;
  }

  public getModelMetaKey(model: PureModel, key: string): any {
    return this.getModelMeta(model)[key];
  }

  public setModelMeta(model: PureModel, meta: IDictionary<any>) {
    const modelData = this.__getModelData(model);
    extendObservable(modelData.meta, meta);
    return modelData.meta;
  }

  public setModelMetaKey(model: PureModel, key: string, value?: any) {
    this.setModelMeta(model, {[key]: value});
  }

  public setModelClassMetaKey(model: typeof PureModel, key: string, value?: any) {
    const data = this.modelClassData.get(model) as IModelClassData;
    Object.assign(data.meta, {[key]: value});
  }

  public getModelClassMetaKey(obj: typeof PureModel, key: string): any {
    return reducePrototypeChain(obj, (value, model) => {
      return value || (this.modelClassData.get(model) || {meta: {}}).meta[key] || null;
    }, null);
  }

  public addModelDefaultField(model: typeof PureModel, key: string, value?: any) {
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

  public getModelDefaults(obj: typeof PureModel): IDictionary<any> {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((this.modelClassData.get(model) || {data: []}).data);
    }, [] as Array<IDictionary<any>>);
    return Object.assign({}, ...defaults.reverse());
  }

  public addModelClassReference(model: typeof PureModel|IType, key: string, options: IReferenceOptions) {
    let modelObj: typeof PureModel|{type: IType};
    if (typeof model === 'number' || typeof model === 'string') {
      modelObj = {type: model};
    } else {
      modelObj = model;
    }
    const data = this.modelClassData.get(modelObj);
    if (data) {
      Object.assign(data.references, {[key]: options});
    } else {
      this.modelClassData.set(modelObj, {
        data: {},
        meta: {},
        references: {[key]: options},
      });
    }
  }

  public getModelClassReferences(obj: typeof PureModel): IDictionary<IReferenceOptions> {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((this.modelClassData.get(model) || {references: {}}).references);
    }, [] as Array<IDictionary<any>>);
    return Object.assign({}, ...defaults.reverse());
  }

  public getModelReferenceOptions(model: PureModel, key: string): IReferenceOptions {
    const refs = this.getModelMetaKey(model, 'refs');
    return refs[key];
  }

  private __getModelData(model: PureModel): IDataStorage {
    return this.modelData.get(model) || this.initModel(model);
  }

  // For testing purposes only
  private clear() {
    this.modelData = new WeakMap<PureModel, IDataStorage>();
    this.modelClassData = new WeakMap<typeof PureModel, IModelClassData>();
  }
}

export const storage = new DataStorage();
