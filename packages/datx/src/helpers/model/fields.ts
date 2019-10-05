import { mapItems, warn } from 'datx-utils';
import {
  IArrayChange,
  IArraySplice,
  intercept,
  IObservableArray,
  isObservableArray,
  observable,
  runInAction,
} from 'mobx';

import { ToMany, ToOne, ToOneOrMany } from '../../buckets';
import { FieldType } from '../../enums/FieldType';
import { ReferenceType } from '../../enums/ReferenceType';
import {
  BACK_REF_READ_ONLY,
  ID_READONLY,
  REF_ARRAY,
  REF_NEEDS_COLLECTION,
  REF_SINGLE,
  TYPE_READONLY,
  WRONG_REF_TYPE,
} from '../../errors';
import { IBucket } from '../../interfaces/IBucket';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { IModelRef } from '../../interfaces/IModelRef';
import { IReferenceOptions } from '../../interfaces/IReferenceOptions';
import { IType } from '../../interfaces/IType';
import { TChange } from '../../interfaces/TChange';
import { TRefValue } from '../../interfaces/TRefValue';
import { getClass } from '../../prop';
import { PureModel } from '../../PureModel';
import { storage } from '../../services/storage';
import { error } from '../format';
import { endAction, startAction, updateAction } from '../patch';
import { initBucket, initModelRef } from './init';
import {
  getModelCollection,
  getModelId,
  getModelMetaKey,
  getModelType,
  isModelReference,
  setModelMetaKey,
} from './utils';

function modelAddReference(model: PureModel, key: string, newReference: PureModel) {
  const refOptions = storage.getModelReferenceOptions(model, key);
  const collection = getModelCollection(model);
  const bucket: IBucket<PureModel> = storage.getModelDataKey(model, key);
  if (bucket) {
    if (bucket.value instanceof Array || isObservableArray(bucket.value)) {
      bucket.value.push(newReference);
    } else if (bucket instanceof ToOneOrMany && bucket.value) {
      bucket.value = [bucket.value, newReference];
    } else {
      bucket.value = newReference;
    }
  } else {
    initBucket(model, key, refOptions.type, collection, newReference);
  }
}

function modelRemoveReference(model: PureModel, key: string, oldReference: PureModel) {
  const bucket: IBucket<PureModel> = storage.getModelDataKey(model, key);
  if (isObservableArray(bucket.value)) {
    bucket.value.remove(oldReference);
  } else {
    bucket.value = null;
  }
}

function backRefSplice(
  model: PureModel,
  key: string,
  change: IArraySplice<PureModel>,
  refOptions: IReferenceOptions,
) {
  const property = refOptions.property as string;
  change.added.forEach((item) => {
    modelAddReference(item, property, model);
  });
  const removed = model[key].slice(change.index, change.index + change.removedCount);
  removed.forEach((item) => {
    modelRemoveReference(item, property, model);
  });

  return null;
}

function backRefChange(
  model: PureModel,
  key: string,
  change: IArrayChange<PureModel>,
  refOptions: IReferenceOptions,
) {
  const property = refOptions.property as string;
  const oldValue = model[key].length > change.index ? model[key][change.index] : null;
  if (change.newValue) {
    modelAddReference(change.newValue, property, model);
  }
  if (oldValue) {
    modelRemoveReference(oldValue, property, model);
  }

  warn(
    `This shouldn't have happened. Please open an issue: https://github.com/infinum/datx/issues/new`,
  );

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

  startAction(model);
  const refs = getModelMetaKey(model, 'refs');
  if (key in refs) {
    updateRef(model, key, value);
  } else {
    updateAction(model, key, value);
    storage.setModelDataKey(model, key, value);
  }

  endAction(model);
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

function getBackRef(
  model: PureModel,
  key: string,
  refOptions: IReferenceOptions,
): PureModel | Array<PureModel> | null {
  const type = getModelType(refOptions.model);

  const collection = getModelCollection(model);
  if (!collection) {
    return null;
  }

  const backModels = collection
    .findAll(type)
    .filter((item) => hasBackRef(item, refOptions.property as string, model));

  const backData: IObservableArray<PureModel> = observable.array(backModels, { deep: false });
  intercept(backData, (change: TChange) => partialBackRefUpdate(model, key, change));

  return backData;
}

function getNormalRef(model: PureModel, key: string): PureModel | Array<PureModel> | null {
  const value: IBucket<PureModel> = storage.getModelDataKey(model, key);

  return value ? value.value : null;
}

export function getRef(model: PureModel, key: string): PureModel | Array<PureModel> | null {
  const refOptions = storage.getModelReferenceOptions(model, key);

  return typeof refOptions.property === 'string'
    ? getBackRef(model, key, refOptions)
    : getNormalRef(model, key);
}

function validateRef(refOptions: IReferenceOptions, isArray: boolean, key: string) {
  if (refOptions.type === ReferenceType.TO_ONE && isArray) {
    throw error(REF_SINGLE, { key });
  } else if (refOptions.type === ReferenceType.TO_MANY && !isArray) {
    throw error(REF_ARRAY, { key });
  } else if (refOptions.property) {
    throw error(BACK_REF_READ_ONLY);
  }
}

export function updateRef(model: PureModel, key: string, value: TRefValue) {
  const refOptions = storage.getModelReferenceOptions(model, key);

  if (!refOptions) {
    if (!value || (value instanceof Array && value.length < 1)) {
      return;
    }

    initModelRef(
      model,
      key,
      {
        model: getModelType(value),
        type: ReferenceType.TO_ONE_OR_MANY,
      },
      value,
    );
  }

  const check = refOptions.type === ReferenceType.TO_MANY ? value || [] : value;
  const isArray = check instanceof Array || isObservableArray(check);
  validateRef(refOptions, isArray, key);

  const collection = getModelCollection(model);
  startAction(model);

  let refs: IModelRef | Array<IModelRef> | null = mapItems(
    value,
    (ref: IIdentifier | IModelRef | PureModel) => {
      if (isModelReference(ref)) {
        return ref as IModelRef;
      }

      if (ref && collection) {
        if (ref instanceof PureModel) {
          const refType = getModelType(ref);
          if (refType !== getModelType(refOptions.model)) {
            endAction(model);
            throw error(WRONG_REF_TYPE);
          }
        }

        let instance = isModelReference(ref)
          ? collection.findOne(ref as IModelRef)
          : collection.findOne(refOptions.model, ref);
        if (!instance && typeof ref === 'object' && !isModelReference(ref)) {
          instance = collection.add(ref, refOptions.model);
        }
        endAction(model);

        return {
          id: getModelId(instance || ref),
          type: getModelType(refOptions.model),
        };
      } else if (ref instanceof PureModel) {
        endAction(model);
        throw error(REF_NEEDS_COLLECTION);
      }

      return {
        id: ref as IIdentifier,
        type: getModelType(refOptions.model),
      };
    },
  );

  if (refOptions.type === ReferenceType.TO_MANY) {
    refs = refs || [];
  }

  updateAction(model, key, refs);
  const bucket: IBucket<PureModel> = storage.getModelDataKey(model, key);
  bucket.value = refs;

  endAction(model);
}

function getModelRefsByType(model: PureModel, type: IType) {
  const refs = getModelMetaKey(model, 'refs');

  return Object.keys(refs)
    .filter((key) => refs[key])
    .filter((key) => !refs[key].property)
    .filter((key) => getModelType(refs[key].model) === type);
}

function updateModelReferences(
  model: PureModel,
  newId: IIdentifier,
  oldId: IIdentifier,
  type: IType,
) {
  const collection = getModelCollection(model);
  if (collection) {
    collection.getAllModels().map((item) => {
      getModelRefsByType(item, type).forEach((ref) => {
        const bucket: IBucket<PureModel> = storage.getModelDataKey(item, ref);
        if (bucket.value instanceof Array || isObservableArray(bucket.value)) {
          const targetIndex = bucket.value.findIndex(
            (modelItem) => getModelId(modelItem) === oldId && getModelType(modelItem) === type,
          );
          if (targetIndex !== -1) {
            bucket.value[targetIndex] = newId;
          }
        } else if (
          bucket.value &&
          getModelId(bucket.value) === oldId &&
          getModelType(bucket.value) === type
        ) {
          bucket.value = {
            id: newId,
            type,
          };
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
  runInAction(() => {
    const collection = getModelCollection(model);

    const oldId = getModelId(model);
    const type = getModelType(model);
    setModelMetaKey(model, 'id', newId);

    const staticModel = model.constructor as typeof PureModel;
    const modelId = storage.getModelClassMetaKey(staticModel, 'id');
    if (modelId) {
      storage.setModelMetaKey(model, 'id', newId);
      const idKey = storage.getModelClassMetaKey(getClass(model), 'id');
      if (idKey) {
        storage.setModelDataKey(model, idKey, newId);
      }
    }

    if (collection) {
      // @ts-ignore - I'm bad and I should feel bad...
      collection.__changeModelId(oldId, newId, type);
    }

    updateModelReferences(model, newId, oldId, type);
  });
}

/**
 * Get the id of the referenced model
 *
 * @export
 * @param {PureModel} model Source model
 * @param {string} key Referenced model property name
 * @returns {IModelRef} Referenced model
 */
export function getRefId(model: PureModel, key: string): IModelRef | Array<IModelRef> | null {
  return storage.getModelDataKey(model, key).refValue;
}

/**
 * Set the id of the referenced model
 *
 * @export
 * @param {PureModel} model Source model
 * @param {string} key Referenced model property name
 * @param {IModelRef} value The new value
 * @returns {void} Referenced model id
 */
export function setRefId(
  model: PureModel,
  key: string,
  value?: IModelRef | Array<IModelRef>,
): void {
  const bucket: IBucket<PureModel> = storage.getModelDataKey(model, key);
  if (bucket instanceof ToMany && !(value instanceof Array)) {
    throw error(REF_ARRAY, { key });
  }
  if (bucket instanceof ToOne && value instanceof Array) {
    throw error(REF_SINGLE, { key });
  }
  bucket.value = value || null;
}
