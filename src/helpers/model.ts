import {
  computed,
  extendObservable,
  IArrayChange,
  IArraySplice,
  intercept,
  IObservableArray,
  isObservableArray,
  observable,
  toJS,
} from 'mobx';

import {Collection} from '../Collection';
import {META_FIELD} from '../consts';
import {ReferenceType} from '../enums/ReferenceType';
import {IDictionary} from '../interfaces/IDictionary';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IRawModel} from '../interfaces/IRawModel';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {IType} from '../interfaces/IType';
import {TRefValue} from '../interfaces/TRefValue';
import {Model} from '../Model';
import {storage} from '../services/storage';
import {error} from './format';
import {mapItems} from './utils';

import {
  MODEL_EXISTS,
  NO_REFS,
  NOT_A_CLONE,
  REF_ARRAY,
  REF_NEEDS_COLLECTION,
  REF_NEEDS_INIT,
  REF_SINGLE,
} from '../errors';

type IChange = IArraySplice<Model> | IArrayChange<Model>;
interface IMetaToInit {
  fields: Array<string>;
  refs: IDictionary<IReferenceOptions>;
}

export function initModelField<T extends Model>(obj: T, key: string, defaultValue: any) {
  const fields = storage.getModelMetaKey(obj, 'fields') as Array<string>;
  if (fields.indexOf(key) === -1) {
    // Initialize the observable field to the default value
    storage.setModelDataKey(obj, key, defaultValue);
    fields.push(key);

    // Set up the computed prop
    extendObservable(obj, {
      [key]: computed(
        () => getField(obj, key),
        (value) => updateField(obj, key, value),
      ),
    });
  } else {
    obj[key] = defaultValue;
  }
}

export function initModelRef<T extends Model>(
  obj: T,
  key: string,
  options: IReferenceOptions,
  initialValue: TRefValue,
) {
  const refs = storage.getModelMetaKey(obj, 'refs');

  if (!(key in refs)) {
    // Initialize the observable field to the given value
    refs[key] = options;

    const isArray = options.type === ReferenceType.TO_MANY;
    storage.setModelDataKey(obj, key, isArray ? [] : undefined);

    // Set up the computed prop
    extendObservable(obj, {
      [key]: computed(
        () => getRef(obj, key),
        (value) => updateRef(obj, key, value),
      ),
    });
  }

  obj[key] = initialValue;
}

function getField(model: Model, key: string) {
  return storage.getModelDataKey(model, key);
}

function updateField(model: Model, key: string, value: any) {
  storage.setModelDataKey(model, key, value);
}

function partialRefUpdate(model: Model, key: string, change: IChange) {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;
  const data = storage.getModelDataKey(model, key);

  if (change.type === 'splice') {
    const added = (change.added || []).map(getModelId);
    data.splice(change.index, change.removedCount, ...added);
    return null;
  } else if (change.type === 'update') {
    data[change.index] = getModelId(change.newValue);
    return null;
  }

  return change;
}

function modelAddReference(model: Model, key: string, newReference: Model) {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;
  const newRefId = getModelId(newReference);
  const data = storage.getModelDataKey(model, key);
  if (refOptions.type === ReferenceType.TO_ONE) {
    storage.setModelDataKey(model, key, newRefId);
  } else if (refOptions.type === ReferenceType.TO_MANY || isObservableArray(data)) {
    data.push(newRefId);
  } else {
    // OneOrMany - single value
    // Convert to array or overwrite?
    storage.setModelDataKey(model, key, newRefId); // Overwrite
  }
}

function modelRemoveReference(model: Model, key: string, oldReference: Model) {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;
  const oldRefId = getModelId(oldReference);
  const data = storage.getModelDataKey(model, key);
  if (refOptions.type === ReferenceType.TO_ONE) {
    storage.setModelDataKey(model, key, null);
  } else if (refOptions.type === ReferenceType.TO_MANY || isObservableArray(data)) {
    data.remove(oldRefId);
  } else {
    storage.setModelDataKey(model, key, null);
  }

}

function partialBackRefUpdate(model: Model, key: string, change: IChange) {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;
  const data = storage.getModelDataKey(model, key);
  const property = refOptions.property as string;

  if (change.type === 'splice') {
    (change.added || []).map((item) => modelAddReference(item, property, model));
    const removed = model[key].slice(change.index, change.index + change.removedCount);
    removed.map((item) => modelRemoveReference(item, property, model));
    return null;
  } else if (change.type === 'update') {
    modelAddReference(change.newValue, property, model);
    modelRemoveReference(change.oldValue, property, model);
    return null;
  }

  return change;
}

function getRef(model: Model, key: string): Model|Array<Model>|null {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;

  if (typeof refOptions.property === 'string') {
    const type = getModelType(refOptions.model);
    const allModels = Object.values(storage.getModelsByType(type));
    const backModels = allModels.filter((item) => {
      const data = item[refOptions.property || '']; // Empty string just to make TS happy... We check the type before
      if (data === null) {
        return false;
      } else if (data instanceof Model) {
        return data === model;
      } else {
        return data.indexOf(model) !== -1;
      }
    });

    const backData: IObservableArray<Model> = observable.array(backModels);
    intercept(backData, (change: IChange) => partialBackRefUpdate(model, key, change));
    return backData;
  }

  const value = storage.getModelDataKey(model, key);
  const dataModels = mapItems(value, (id) => storage.findModel(refOptions.model, id));
  if (dataModels instanceof Array) {
    const data: IObservableArray<Model> = observable.array(dataModels);
    intercept(data, (change: IChange) => partialRefUpdate(model, key, change));
    return data;
  }

  return dataModels;
}

function updateRef(model: Model, key: string, value: TRefValue) {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;
  const ids = refOptions.type === ReferenceType.TO_MANY
    ? (mapItems(value, getModelId) || [])
    : mapItems(value, getModelId);

  if (refOptions.type === ReferenceType.TO_ONE && ids instanceof Array) {
    throw error(REF_SINGLE, {key});
  } else if (refOptions.type === ReferenceType.TO_MANY && !(ids instanceof Array)) {
    throw error(REF_ARRAY, {key});
  }

  if (refOptions.property) {
    // TODO: Back reference
    return;
  }

  const inCollection = mapItems(value, (ref) => storage.isInCollection(refs[key].model, ref));
  if (
    (inCollection instanceof Array && !inCollection.every(Boolean) && (value as Array<any>).length) ||
    (value && !inCollection)
  ) {
    throw error(REF_NEEDS_COLLECTION);
  }

  storage.setModelDataKey(model, key, ids);
}

export function getModelType(model: IType|typeof Model|Model): IType {
  if (typeof model === 'function') {
    return model.type;
  } else if (typeof model === 'object') {
    return storage.getModelDataKey(model, 'type') || (model.constructor as typeof Model).type;
  }
  return model;
}

export function getModelId(model: Model|IIdentifier): IIdentifier {
  if (model instanceof Model) {
    return storage.getModelMetaKey(model, 'id');
  }
  return model;
}

export function getModelCollections(model: Model): Array<Collection> {
  return storage.getModelCollections(model);
}

export function cloneModel<T extends Model>(model: T): T {
  const TypeModel = model.constructor as typeof Model;
  const rawData = modelToJSON(model);
  if (rawData[META_FIELD] && typeof rawData[META_FIELD] === 'object' && rawData[META_FIELD] !== undefined) {
    const meta = (rawData[META_FIELD] as IDictionary<any>);
    meta.originalId = meta.id;
    delete meta.id;
  }

  // TODO: Warning if model is not in a collection

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
      assignModel(model, key, data[key]);
    }
  });
  return model;
}

export function assignModel<T extends Model>(model: T, key: string, value: any): void {
  const refs = storage.getModelMetaKey(model, 'refs') as IDictionary<IReferenceOptions>;
  if (key in refs) {
    assignModelRef(model, key, value);
  } else if (value instanceof Model) {
    throw error(NO_REFS, {key});
  } else {
    assignModelField(model, key, value);
  }
}

function assignModelField<T extends Model>(model: T, key: string, value: any): void {
  const fields = storage.getModelMetaKey(model, 'fields') as Array<string>;
  if (fields.indexOf(key) !== -1) {
    model[key] = value;
  } else {
    initModelField(model, key, value);
  }
}

function assignModelRef<T extends Model>(
  model: T,
  key: string,
  value: IIdentifier|Model|Array<IIdentifier>|Array<Model>,
): void {
  const refs = storage.getModelMetaKey(model, 'refs');
  if (key in refs) {
    model[key] = value;
  } else {
    throw error(REF_NEEDS_INIT, {key});
  }
}

export function getMetaKeyFromRaw(data: IRawModel, key: string): any {
  if (META_FIELD in data && typeof data[META_FIELD] === 'object' && data[META_FIELD] !== undefined) {
    return (data[META_FIELD] as IDictionary<any>)[key];
  }
  return undefined;
}

function initModelData(model: Model, data: IRawModel, meta: IMetaToInit) {
  const staticModel = model.constructor as typeof Model;

  const classRefs = storage.getModelClassReferences(staticModel);
  const refs = Object.assign({}, classRefs, meta.refs);
  const fields = meta.fields.slice();
  const defaults = storage.getModelDefaults(staticModel);

  Object.keys(data).concat(Object.keys(defaults))
    .forEach((key) => {
      if (!(key in refs) && fields.indexOf(key) === -1) {
        fields.push(key);
      }
    });

  fields.forEach((key) => {
    initModelField(model, key, data[key] || defaults[key] || undefined);
  });

  Object.keys(refs).forEach((key) => {
    const opts = refs[key];
    initModelRef(model, key, opts, data[key] || defaults[key] || undefined);
  });
}

function initModelMeta(model: Model, data: IRawModel): IDictionary<any> & IMetaToInit {
  const staticModel = model.constructor as typeof Model;
  const meta = {
    fields: [],
    id: staticModel.getAutoId(),
    refs: {},
    type: getModelType(model),
  };

  let newMeta;
  const toInit: IMetaToInit = {fields: [], refs: {}};
  if (META_FIELD in data && data[META_FIELD]) {
    const oldMeta = data[META_FIELD] || {};
    if (oldMeta) {
      toInit.fields = oldMeta.fields;
      delete oldMeta.fields;
      toInit.refs = oldMeta.refs;
      delete oldMeta.refs;
    }
    newMeta = storage.setModelMeta(model, Object.assign(meta, oldMeta));
    delete data[META_FIELD];
  } else {
    newMeta = storage.setModelMeta(model, meta);
  }
  return Object.assign({}, newMeta, toInit);
}

export function initModel(model: Model, rawData: IRawModel) {
  const staticModel = model.constructor as typeof Model;
  const data = Object.assign({}, staticModel.preprocess(rawData));

  const meta = initModelMeta(model, data);

  const existingModel = storage.isInCollection(meta.type, meta.id);
  if (existingModel) {
    throw error(MODEL_EXISTS);
  }

  initModelData(model, data, meta);
}

export function modelToJSON(model: Model): IRawModel {
  const data = toJS(storage.getModelData(model));
  const meta = toJS(storage.getModelMeta(model));
  return Object.assign(data, {[META_FIELD]: meta});
}
