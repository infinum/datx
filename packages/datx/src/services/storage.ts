import { IDictionary } from 'datx-utils';
import { observable, set } from 'mobx';

import { MODEL_REQUIRED } from '../errors';
import { error } from '../helpers/format';
import { reducePrototypeChain } from '../helpers/selectors';
import { IDataStorage } from '../interfaces/IDataStorage';
import { IReferenceOptions } from '../interfaces/IReferenceOptions';
import { PureModel } from '../PureModel';

interface IModelClassData {
  data: IDictionary;
  meta: IDictionary;
  references: IDictionary<IReferenceOptions>;
}

const DATX_KEY = Symbol.for('datx metadata');

function setMeta(model, value) {
  Object.defineProperty(model, DATX_KEY, {
    enumerable: false,
    value,
    writable: false,
  });
}

export class DataStorage {
  public initModel(model: PureModel) {
    const modelData = observable({data: {}, meta: {}});
    setMeta(model, modelData);

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
    const data: IDataStorage|undefined = model[DATX_KEY];

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
    let data = model[DATX_KEY] as IModelClassData;
    if (!data) {
      data = {
        data: {},
        meta: {},
        references: {},
      };
      setMeta(model, data);
    }
    Object.assign(data.meta, {[key]: value});
  }

  public getModelClassMetaKey(obj: typeof PureModel, key: string): any {
    return reducePrototypeChain(obj, (value, model) => {
      return value || (model[DATX_KEY] || {meta: {}}).meta[key] || null;
    }, null);
  }

  public addModelDefaultField(model: typeof PureModel, key: string, value?: any) {
    const data = model[DATX_KEY];
    if (data) {
      Object.assign(data.data, {[key]: value});
    } else {
      setMeta(model, {
        data: {[key]: value},
        meta: {},
        references: {},
      });
    }
  }

  public getModelDefaults(obj: typeof PureModel): IDictionary {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((model[DATX_KEY] || {data: []}).data);
    }, [] as Array<IDictionary>);

    return Object.assign({}, ...defaults.reverse());
  }

  public addModelClassReference(model: typeof PureModel, key: string, options: IReferenceOptions) {
    if (!options.model && options.model !== 0) {
      throw error(MODEL_REQUIRED);
    }

    const data = model[DATX_KEY];
    if (data) {
      Object.assign(data.references, {[key]: options});
    } else {
      setMeta(model, {
        data: {},
        meta: {},
        references: {[key]: options},
      });
    }
  }

  public getModelClassReferences(obj: typeof PureModel): IDictionary<IReferenceOptions> {
    const defaults = reducePrototypeChain(obj, (state, model) => {
      return state.concat((model[DATX_KEY] || {references: {}}).references);
    }, [] as Array<IDictionary>);

    return Object.assign({}, ...defaults.reverse());
  }

  public getModelReferenceOptions(model: PureModel, key: string): IReferenceOptions {
    const refs = this.getModelMetaKey(model, 'refs');

    return refs[key];
  }

  private __getModelData(model: PureModel): IDataStorage {
    return model[DATX_KEY] || this.initModel(model);
  }
}

export const storage = new DataStorage();
