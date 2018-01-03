import {IArrayChange, IArraySplice, intercept, IObservableArray, isObservableArray, observable} from 'mobx';

import {FieldType} from '../../enums/FieldType';
import {ReferenceType} from '../../enums/ReferenceType';
import {
  BACK_REF_READ_ONLY,
  ID_READONLY,
  REF_ARRAY,
  REF_NEEDS_COLLECTION,
  REF_SINGLE,
  TYPE_READONLY,
} from '../../errors';
import {IIdentifier} from '../../interfaces/IIdentifier';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {IType} from '../../interfaces/IType';
import {TChange} from '../../interfaces/TChange';
import {TRefValue} from '../../interfaces/TRefValue';
import {Model} from '../../Model';
import {storage} from '../../services/storage';
import {error} from '../format';
import {isFalsyArray, mapItems} from '../utils';
import {getModelCollections, getModelId, getModelType} from './utils';

function modelAddReference(model: Model, key: string, newReference: Model) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const newRefId = getModelId(newReference);
  const data = storage.getModelDataKey(model, key);
  if (refOptions.type === ReferenceType.TO_ONE) {
    storage.setModelDataKey(model, key, newRefId);
  } else if (refOptions.type === ReferenceType.TO_MANY || isObservableArray(data)) {
    data.push(newRefId);
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
  }
}

function partialRefUpdate(model: Model, key: string, change: TChange) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const data = storage.getModelDataKey(model, key);

  if (change.type === 'splice') {
    const added = change.added.map(getModelId);
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
  change.added.map((item) => modelAddReference(item, property, model));
  const removed = model[key].slice(change.index, change.index + change.removedCount);
  removed.map((item) => modelRemoveReference(item, property, model));
  return null;
}

function backRefChange(model: Model, key: string, change: IArrayChange<Model>, refOptions: IReferenceOptions) {
  const property = refOptions.property as string;
  const oldValue = model[key].length > change.index ? model[key][change.index] : null;
  if (change.newValue) {
    modelAddReference(change.newValue, property, model);
  }
  if (oldValue) {
    modelRemoveReference(oldValue, property, model);
  }
  return null;
}

function partialBackRefUpdate(model: Model, key: string, change: TChange) {
  const refOptions = storage.getModelReferenceOptions(model, key);

  if (change.type === 'splice') {
    return backRefSplice(model, key, change, refOptions);
  } else if (change.type === 'update') {
    return backRefChange(model, key, change, refOptions);
  }

  return change;
}

export function getField(model: Model, key: string) {
  return storage.getModelDataKey(model, key);
}

export function updateField(model: Model, key: string, value: any, type: FieldType = FieldType.DATA) {
  if (type === FieldType.TYPE) {
    throw error(TYPE_READONLY);
  } else if (type === FieldType.ID) {
    throw error(ID_READONLY);
  }
  storage.setModelDataKey(model, key, value);
}

function hasBackRef(item: Model, property: string, target: Model): boolean {
  if (item[property] === null || item[property] === undefined) {
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
    .map((id) => allModels[id])
    .filter((item) => hasBackRef(item, refOptions.property as string, model));

  const backData: IObservableArray<Model> = observable.shallowArray(backModels);
  intercept(backData, (change: TChange) => partialBackRefUpdate(model, key, change));
  return backData;
}

function getNormalRef(model: Model, key: string, refOptions: IReferenceOptions): Model|Array<Model>|null {
  const value = storage.getModelDataKey(model, key);
  const dataModels = mapItems(value, (id) => storage.findModel(refOptions.model, id));
  if (dataModels instanceof Array) {
    const data: IObservableArray<Model> = observable.shallowArray(dataModels);
    intercept(data, (change: TChange) => partialRefUpdate(model, key, change));
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

function getModelRefsByType(model: Model, type: IType) {
  const refs = storage.getModelMetaKey(model, 'refs');
  return Object.keys(refs)
    .filter((key) => !refs[key].property)
    .filter((key) => getModelType(refs[key].model) === type);
}

function updateModelReferences(newId: IIdentifier, oldId: IIdentifier, type: IType) {
  const allModels = storage.getAllModels().map((item) => {
    getModelRefsByType(item, type).forEach((ref) => {
      const data = storage.getModelDataKey(item, ref);
      if (data instanceof Array || isObservableArray(data)) {
        const targetIndex = data.indexOf(oldId);
        if (targetIndex !== -1) {
          data[targetIndex] = newId;
        }
      } else if (data === oldId) {
        storage.setModelDataKey(item, ref, newId);
      }
    });
  });
}

/**
 * Updates the model identifier and all the existing references to the model
 *
 * @export
 * @param {Model} model Model to be updated
 * @param {IIdentifier} newId New model identifier
 */
export function updateModelId(model: Model, newId: IIdentifier): void {
  const collections = getModelCollections(model);

  const oldId = getModelId(model);
  const type = getModelType(model);
  storage.setModelMetaKey(model, 'id', newId);

  const staticModel = model.constructor as typeof Model;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id');
  if (modelId) {
    storage.setModelDataKey(model, modelId, newId);
  }

  collections.forEach((collection) => {
    // @ts-ignore - I'm bad and I should feel bad...
    collection.__changeModelId(oldId, newId, type);
  });

  updateModelReferences(newId, oldId, type);
}
