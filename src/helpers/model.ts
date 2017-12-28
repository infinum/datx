import {computed, extendObservable, toJS} from 'mobx';

import {Collection} from '../Collection';
import {META_FIELD} from '../consts';
import {MODEL_EXISTS, NOT_A_CLONE} from '../errors';
import {IDictionary} from '../interfaces/IDictionary';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IRawModel} from '../interfaces/IRawModel';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';
import {storage} from '../services/storage';
import {error} from './format';

export function setInitial<T extends Model>(obj: T, key: string, defaultValue: any) {

  // Initialize the observable field to the default value
  storage.setModelDataKey(obj, key, defaultValue);

  // Set up the computed prop
  extendObservable(obj, {
    [key]: computed(
      () => storage.getModelDataKey(obj, key),
      (value) => storage.setModelDataKey(obj, key, value),
    ),
  });
}

export function getModelType(model: IType|typeof Model|Model): IType {
  if (typeof model === 'function') {
    return model.type;
  } else if (typeof model === 'object') {
    return storage.getModelDataKey(model, 'type') || (model.constructor as typeof Model).type;
  }
  return model;
}

export function getModelId(model: Model): IIdentifier {
  return storage.getModelMetaKey(model, 'id');
}

export function getModelCollections(model: Model): Array<Collection> {
  return storage.getModelCollections(model);
}

export function cloneModel<T extends Model>(model: T): T {
  const TypeModel = model.constructor as typeof Model;
  const rawData = modelToJSON(model);
  if (rawData[META_FIELD] && typeof rawData[META_FIELD] === 'object' && rawData[META_FIELD] !== undefined) {
    // @ts-ignore - TS is stupid...
    rawData[META_FIELD].originalId = rawData[META_FIELD].id;
    // @ts-ignore - TS is stupid...
    delete rawData[META_FIELD].id;
  }
  return new TypeModel(rawData) as T;
}

export function getOriginalModel(model: Model) {
  const originalId = storage.getModelMetaKey(model, 'originalId');
  if (originalId) {
    return storage.findModel(model, originalId);
  }
  throw error(NOT_A_CLONE);
}

export function updateModel<T extends Model>(model: T, data: IDictionary<any>): T {
  Object.keys(data).forEach((key) => {
    if (key !== META_FIELD) {
      assignModelKey(model, key, data[key]);
    }
  });
  return model;
}

export function assignModelKey<T extends Model>(model: T, key: string, value: any): void {
  if (key in model) {
    model[key] = value;
  } else {
    setInitial(model, key, value);
  }
}

export function getMetaKeyFromRaw(data: IRawModel, key: string): any {
  if (META_FIELD in data && typeof data[META_FIELD] === 'object' && data[META_FIELD] !== undefined) {
    // @ts-ignore - TS is stupid...
    return data[META_FIELD][key];
  }
  return undefined;
}

export function initModelData(model: Model, data: IRawModel) {
  const staticModel = model.constructor as typeof Model;

  const defaults = storage.getModelDefaults(staticModel);
  Object.keys(defaults)
    .filter((key) => !(key in data))
    .forEach((key) => {
      setInitial(model, key, defaults[key]);
    });

  Object.keys(data)
    .forEach((key) => {
      setInitial(model, key, data[key]);
    });
}

export function initModelMeta(model: Model, data: IRawModel): IDictionary<any> {
  const staticModel = model.constructor as typeof Model;
  const meta = {
    id: staticModel.getAutoId(),
    type: getModelType(model),
  };

  let newMeta;
  if (META_FIELD in data && data[META_FIELD]) {
    newMeta = storage.setModelMeta(model, Object.assign(meta, data[META_FIELD] || {}));
    delete data[META_FIELD];
  } else {
    newMeta = storage.setModelMeta(model, meta);
  }
  return newMeta;
}

export function initModel(model: Model, rawData: IRawModel) {
  const staticModel = model.constructor as typeof Model;
  const data = Object.assign({}, staticModel.preprocess(rawData));

  const meta = initModelMeta(model, data);

  const existingModel = storage.findModel(meta.type, meta.id);
  if (existingModel) {
    throw error(MODEL_EXISTS);
  }

  initModelData(model, data);

  storage.registerModel(model);
}

export function modelToJSON(model: Model): IRawModel {
  const data = toJS(storage.getModelData(model));
  const meta = toJS(storage.getModelMeta(model));
  return Object.assign(data, {[META_FIELD]: meta});
}
