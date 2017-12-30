import {IArrayChange, IArraySplice, intercept, IObservableArray, isObservableArray, observable} from 'mobx';

import {ReferenceType} from '../../enums/ReferenceType';
import {BACK_REF_READ_ONLY, REF_ARRAY, REF_NEEDS_COLLECTION, REF_SINGLE} from '../../errors';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {TRefValue} from '../../interfaces/TRefValue';
import {Model} from '../../Model';
import {storage} from '../../services/storage';
import {error} from '../format';
import {mapItems} from '../utils';
import {getModelId, getModelType} from './utils';

type IChange = IArraySplice<Model> | IArrayChange<Model>;

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

function partialBackRefUpdate(model: Model, key: string, change: IChange) {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;
  const data = storage.getModelDataKey(model, key);
  const property = refOptions.property as string;

  if (change.type === 'splice') {
    (change.added || []).map((item) => modelAddReference(item, property, model));
    const removed = model[key].slice(change.index, change.index + change.removedCount);
    removed
      .map((item) => storage.findModel(refOptions.model, item))
      .map((item) => modelRemoveReference(item, property, model));
    return null;
  } else if (change.type === 'update') {
    modelAddReference(change.newValue, property, model);
    modelRemoveReference(change.oldValue, property, model);
    return null;
  }

  return change;
}

export function getField(model: Model, key: string) {
  return storage.getModelDataKey(model, key);
}

export function updateField(model: Model, key: string, value: any) {
  storage.setModelDataKey(model, key, value);
}

export function getRef(model: Model, key: string): Model|Array<Model>|null {
  const refs = storage.getModelMetaKey(model, 'refs');
  const refOptions = refs[key] as IReferenceOptions;

  if (typeof refOptions.property === 'string') {
    const type = getModelType(refOptions.model);

    const allModels = storage.getModelsByType(type);
    const backModels = Object.keys(allModels).filter((id) => {
      const item = allModels[id];
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

export function updateRef(model: Model, key: string, value: TRefValue) {
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
    throw error(BACK_REF_READ_ONLY);
  }

  const referencedModels = mapItems(value, (ref) => storage.findModel(refs[key].model, ref));
  if (
    (referencedModels instanceof Array && !referencedModels.every(Boolean) && (value as Array<any>).length) ||
    (value && !referencedModels)
  ) {
    throw error(REF_NEEDS_COLLECTION);
  }

  storage.setModelDataKey(model, key, ids);
}
