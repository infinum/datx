import {isFalsyArray, mapItems} from 'datx-utils';
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
import {PureModel} from '../../PureModel';
import {storage} from '../../services/storage';
import {error} from '../format';
import {getModelCollection, getModelId, getModelType} from './utils';

function modelAddReference(model: PureModel, key: string, newReference: PureModel) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const newRefId = getModelId(newReference);
  const data = storage.getModelDataKey(model, key);
  if (refOptions.type === ReferenceType.TO_ONE) {
    storage.setModelDataKey(model, key, newRefId);
  } else if (refOptions.type === ReferenceType.TO_MANY || isObservableArray(data)) {
    data.push(newRefId);
  } else {
    storage.setModelDataKey(model, key, newReference);
  }
}

function modelRemoveReference(model: PureModel, key: string, oldReference: PureModel) {
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

function partialRefUpdate(model: PureModel, key: string, change: TChange) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const data = storage.getModelDataKey(model, key);

  if (change.type === 'splice') {
    const added = change.added.map(getModelId);
    data.splice(change.index, change.removedCount, ...added);
    return null;
  }

  data[change.index] = getModelId(change.newValue);
  return null;
}

function backRefSplice(model: PureModel, key: string, change: IArraySplice<PureModel>, refOptions: IReferenceOptions) {
  const property = refOptions.property as string;
  change.added.map((item) => modelAddReference(item, property, model));
  const removed = model[key].slice(change.index, change.index + change.removedCount);
  removed.map((item) => modelRemoveReference(item, property, model));
  return null;
}

function backRefChange(model: PureModel, key: string, change: IArrayChange<PureModel>, refOptions: IReferenceOptions) {
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

function partialBackRefUpdate(model: PureModel, key: string, change: TChange) {
  const refOptions = storage.getModelReferenceOptions(model, key);

  if (change.type === 'splice') {
    return backRefSplice(model, key, change, refOptions);
  }
  return backRefChange(model, key, change, refOptions);
}

export function getField(model: PureModel, key: string) {
  return storage.getModelDataKey(model, key);
}

export function updateField(model: PureModel, key: string, value: any, type: FieldType) {
  if (type === FieldType.TYPE) {
    throw error(TYPE_READONLY);
  } else if (type === FieldType.ID) {
    throw error(ID_READONLY);
  }
  storage.setModelDataKey(model, key, value);
}

function hasBackRef(item: PureModel, property: string, target: PureModel): boolean {
  if (item[property] === null || item[property] === undefined) {
    return false;
  } else if (item[property] instanceof PureModel) {
    return item[property] === target;
  } else {
    return item[property].indexOf(target) !== -1;
  }
}

function getBackRef(model: PureModel, key: string, refOptions: IReferenceOptions): PureModel|Array<PureModel>|null {
  const type = getModelType(refOptions.model);

  const collection = getModelCollection(model);
  if (!collection) {
    return null;
  }

  const backModels = collection
    .findAll(type)
    .filter((item) => hasBackRef(item, refOptions.property as string, model));

  const backData: IObservableArray<PureModel> = observable.shallowArray(backModels);
  intercept(backData, (change: TChange) => partialBackRefUpdate(model, key, change));
  return backData;
}

function getNormalRef(model: PureModel, key: string, refOptions: IReferenceOptions): PureModel|Array<PureModel>|null {
  const value = storage.getModelDataKey(model, key);
  const collection = getModelCollection(model);
  if (!collection) {
    return null;
  }

  let dataModels = mapItems(value, (id) => id ? collection.find(refOptions.model, id) : id);
  if (refOptions.type === ReferenceType.TO_MANY && !(dataModels instanceof Array)) {
    dataModels = [dataModels];
  }
  if (dataModels instanceof Array) {
    const data: IObservableArray<PureModel> = observable.shallowArray(dataModels);
    intercept(data, (change: TChange) => partialRefUpdate(model, key, change));
    return data;
  }
  return dataModels;

}

export function getRef(model: PureModel, key: string): PureModel|Array<PureModel>|null {
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

export function updateRef(model: PureModel, key: string, value: TRefValue) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const ids = refOptions.type === ReferenceType.TO_MANY
    ? (mapItems(value, getModelId) || [])
    : mapItems(value, getModelId);

  validateRef(refOptions, ids instanceof Array, key);

  if (!ids || (ids instanceof Array && ids.length === 0)) {
    storage.setModelDataKey(model, key, ids);
  } else {
    const collection = getModelCollection(model);

    const referencedModels = mapItems(value, (ref) => {
      if (ref !== null && collection) {
        return collection.find(refOptions.model, ref);
      } else if (ref instanceof PureModel) {
        throw error(REF_NEEDS_COLLECTION);
      }
      return ref;
    });

    const isInvalidArray = isFalsyArray(referencedModels) && (value as Array<any>).length;

    // TODO: Should this be checked?
    const isInvalidModel = false; // Boolean(value) && !referencedModels;

    if (isInvalidArray || isInvalidModel) {
      throw error(REF_NEEDS_COLLECTION);
    }

    storage.setModelDataKey(model, key, ids);
  }
}

function getModelRefsByType(model: PureModel, type: IType) {
  const refs = storage.getModelMetaKey(model, 'refs');
  return Object.keys(refs)
    .filter((key) => !refs[key].property)
    .filter((key) => getModelType(refs[key].model) === type);
}

function updateModelReferences(model: PureModel, newId: IIdentifier, oldId: IIdentifier, type: IType) {
  const collection = getModelCollection(model);
  if (collection) {
    const allModels = collection.getAllModels().map((item) => {
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
}

/**
 * Updates the model identifier and all the existing references to the model
 *
 * @export
 * @param {PureModel} model Model to be updated
 * @param {IIdentifier} newId New model identifier
 */
export function updateModelId(model: PureModel, newId: IIdentifier): void {
  const collection = getModelCollection(model);

  const oldId = getModelId(model);
  const type = getModelType(model);
  storage.setModelMetaKey(model, 'id', newId);

  const staticModel = model.constructor as typeof PureModel;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id');
  if (modelId) {
    storage.setModelDataKey(model, modelId, newId);
  }

  // @ts-ignore - I'm bad and I should feel bad...
  collection.__changeModelId(oldId, newId, type);

  updateModelReferences(model, newId, oldId, type);
}

/**
 * Get the id of the referenced model
 *
 * @export
 * @param {PureModel} model Source model
 * @param {string} key Referenced model property name
 * @returns {IIdentifier} Referenced model id
 */
export function getRefId(model: PureModel, key: string): IIdentifier {
  return storage.getModelDataKey(model, key);
}
