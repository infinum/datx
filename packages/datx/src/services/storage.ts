import {IDictionary} from 'datx-utils';
import {observable, set} from 'mobx';

import {MODEL_REQUIRED} from '../errors';
import {error} from '../helpers/format';
import {reducePrototypeChain} from '../helpers/selectors';
import {IDataStorage} from '../interfaces/IDataStorage';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {PureModel} from '../PureModel';

interface IModelClassData {
  data: IDictionary;
  meta: IDictionary;
  references: IDictionary<IReferenceOptions>;
}

export class DataStorage {
  private modelData = new WeakMap<PureModel, IDataStorage>();

  private modelClassData = new WeakMap<typeof PureModel|{type: IType}, IModelClassData>();

  public initModel(model: PureModel) {
    const modelData = observable({data: {}, meta: {}});
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

  public setModelData(model: PureModel, data: IDictionary) {
    const modelData = this.__getModelData(model);
    set(modelData.data, data);
  }

  public setModelDataKey(model: PureModel, key: string, value?: any) {
    this.setModelData(model, {[key]: value});
  }

  public getModelMeta(model: PureModel): IDictionary {
    const data: IDataStorage|undefined = this.modelData.get(model);

    if (data) {
      return data.meta;
    }

    return this.setModelMeta(model, {});
  }

  public getModelMetaKey(model: PureModel, key: string): any {
    return this.getModelMeta(model)[key];
  }

  public setModelMeta(model: PureModel, meta: IDictionary) {
    const modelData = this.__getModelData(model);
    set(modelData.meta, meta);

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

  public getModelDefaults(obj: typeof PureModel): IDictionary {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((this.modelClassData.get(model) || {data: []}).data);
    }, [] as Array<IDictionary>);

    return Object.assign({}, ...defaults.reverse());
  }

  public addModelClassReference(model: typeof PureModel, key: string, options: IReferenceOptions) {
    if (!options.model && options.model !== 0) {
      throw error(MODEL_REQUIRED);
    }

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

  public getModelClassReferences(obj: typeof PureModel): IDictionary<IReferenceOptions> {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((this.modelClassData.get(model) || {references: {}}).references);
    }, [] as Array<IDictionary>);

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
