import {IArrayChange, IArraySplice, intercept, IObservableArray, isObservableArray, observable} from 'mobx';

import {ReferenceType} from '../../enums/ReferenceType';
import {BACK_REF_READ_ONLY, REF_ARRAY, REF_NEEDS_COLLECTION, REF_SINGLE} from '../../errors';
import {IIdentifier} from '../../interfaces/IIdentifier';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {TRefValue} from '../../interfaces/TRefValue';
import {Model} from '../../Model';
import {storage} from '../../services/storage';
import {error} from '../format';
import {isFalsyArray, mapItems} from '../utils';
import {getModelId, getModelType} from './utils';

type IChange = IArraySplice<Model> | IArrayChange<Model>;

function modelAddReference(model: Model, key: string, newReference: Model) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const newRefId = getModelId(newReference);
  const data = storage.getModelDataKey(model, key);
  if (refOptions.type === ReferenceType.TO_ONE) {
    storage.setModelDataKey(model, key, newRefId);
  } else if (refOptions.type === ReferenceType.TO_MANY || isObservableArray(data)) {
    data.push(newRefId);
  } else {
    // OneOrMany - single value - convert to array or overwrite?
    storage.setModelDataKey(model, key, newRefId); // Overwrite
  }
}

function modelRemoveReference(model: Model, key: string, oldReference: Model) {
  const refOptions = storage.getModelReferenceOptions(model, key);
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

function partialRefUpdate(model: Model, key: string, change: IChange) {
  const refOptions = storage.getModelReferenceOptions(model, key);
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

function backRefSplice(model: Model, key: string, change: IArraySplice<Model>, refOptions: IReferenceOptions) {
  const property = refOptions.property as string;
  (change.added || []).map((item) => modelAddReference(item, property, model));
  const removed = model[key].slice(change.index, change.index + change.removedCount);
  removed
    .map((item) => storage.findModel(refOptions.model, item))
    .map((item) => modelRemoveReference(item, property, model));
}

function backRefChange(model: Model, change: IArrayChange<Model>, refOptions: IReferenceOptions) {
  const property = refOptions.property as string;
  modelAddReference(change.newValue, property, model);
  modelRemoveReference(change.oldValue, property, model);
}

function partialBackRefUpdate(model: Model, key: string, change: IChange) {
  const refOptions = storage.getModelReferenceOptions(model, key);

  if (change.type === 'splice') {
    return backRefSplice(model, key, change, refOptions);
  } else if (change.type === 'update') {
    return backRefChange(model, change, refOptions);
  }

  return change;
}

export function getField(model: Model, key: string) {
  return storage.getModelDataKey(model, key);
}

export function updateField(model: Model, key: string, value: any) {
  storage.setModelDataKey(model, key, value);
}

function hasBackRef(item: Model, property: string, target: Model): boolean {
  if (item[property] === null) {
    return false;
  } else if (item[property] instanceof Model) {
    return item[property] === target;
  } else {
    return item[property].indexOf(target) !== -1;
  }
}

function getBackRef(model: Model, key: string, refOptions: IReferenceOptions): Model|Array<Model>|null {
  const type = getModelType(refOptions.model);

  const allModels = storage.getModelsByType(type);
  const backModels = Object.keys(allModels)
    .filter((id) => hasBackRef(allModels[id], refOptions.property as string, model));

  const backData: IObservableArray<Model> = observable.array(backModels);
  intercept(backData, (change: IChange) => partialBackRefUpdate(model, key, change));
  return backData;
}

function getNormalRef(model: Model, key: string, refOptions: IReferenceOptions): Model|Array<Model>|null {
  const value = storage.getModelDataKey(model, key);
  const dataModels = mapItems(value, (id) => storage.findModel(refOptions.model, id));
  if (dataModels instanceof Array) {
    const data: IObservableArray<Model> = observable.array(dataModels);
    intercept(data, (change: IChange) => partialRefUpdate(model, key, change));
    return data;
  }
  return dataModels;

}

export function getRef(model: Model, key: string): Model|Array<Model>|null {
  const refOptions = storage.getModelReferenceOptions(model, key);

  return (typeof refOptions.property === 'string')
    ? getBackRef(model, key, refOptions)
    : getNormalRef(model, key, refOptions);
}

function validateRef(refOptions: IReferenceOptions, isArray: boolean, key: string) {
  if (refOptions.type === ReferenceType.TO_ONE && isArray) {
    throw error(REF_SINGLE, {key});
  } else if (refOptions.type === ReferenceType.TO_MANY && !isArray) {
    throw error(REF_ARRAY, {key});
  } else if (refOptions.property) {
    throw error(BACK_REF_READ_ONLY);
  }
}

export function updateRef(model: Model, key: string, value: TRefValue) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const ids = refOptions.type === ReferenceType.TO_MANY
    ? (mapItems(value, getModelId) || [])
    : mapItems(value, getModelId);

  validateRef(refOptions, ids instanceof Array, key);

  const referencedModels = mapItems(value, (ref) => storage.findModel(refOptions.model, ref));

  const isInvalidArray = isFalsyArray(referencedModels) && (value as Array<any>).length;
  const isInvalidModel = Boolean(value) && !referencedModels;
  if (isInvalidArray || isInvalidModel) {
    throw error(REF_NEEDS_COLLECTION);
  }

  storage.setModelDataKey(model, key, ids);
}
