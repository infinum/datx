import {IDictionary, IRawModel, META_FIELD, warn} from 'datx-utils';
import {toJS} from 'mobx';

import {NO_REFS, NOT_A_CLONE, REF_NEEDS_COLLECTION} from '../../errors';
import {IIdentifier} from '../../interfaces/IIdentifier';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {IType} from '../../interfaces/IType';
import {TRefValue} from '../../interfaces/TRefValue';
import {PureCollection} from '../../PureCollection';
import {PureModel} from '../../PureModel';
import {storage} from '../../services/storage';
import {error} from '../format';
import {initModelField} from '../model/init';
import {endAction, startAction} from '../patch';

/**
 * Get the model type
 *
 * @export
 * @param {(IType|typeof PureModel|PureModel)} model Model to be checked
 * @returns {IType} Model type
 */
export function getModelType(model: IType|typeof PureModel|PureModel): IType {
  if (typeof model === 'function') {
    // @ts-ignore
    return model.type;
  } else if (typeof model === 'object') {
    return getModelMetaKey(model, 'type') || (model.constructor as typeof PureModel).type;
  }

  return model;
}

/**
 * Get the model identifier
 *
 * @export
 * @param {(PureModel|IIdentifier)} model Model to be checked
 * @returns {IIdentifier} Model identifier
 */
export function getModelId(model: PureModel|IIdentifier): IIdentifier {
  if (model instanceof PureModel) {
    return getModelMetaKey(model, 'id');
  }

  return model;
}

/**
 * Get a collection the given model belongs to
 *
 * @export
 * @param {PureModel} model Model to be checked
 * @returns {PureCollection} A collection the given model belongs to
 */
export function getModelCollection(model: PureModel): PureCollection|undefined {
  return getModelMetaKey(model, 'collection');
}

/**
 * Clone the given model
 *
 * @export
 * @template T
 * @param {T} model Model to be clones
 * @returns {T} Cloned model object
 */
export function cloneModel<T extends PureModel>(model: T): T {
  const TypeModel = model.constructor as typeof PureModel;
  const rawData = modelToJSON(model);
  const meta = rawData[META_FIELD] || {};
  meta.originalId = meta.id;
  delete meta.id;

  const clone = new TypeModel(rawData) as T;

  const collection = getModelCollection(model);
  if (collection) {
    collection.add(clone);
  } else {
    warn(`The model is not in the collection. Referencing the original model won't be possible`);
  }

  return clone;
}

/**
 * Get the original model for the cloned model
 *
 * @export
 * @param {PureModel} model Cloned model
 * @returns {PureModel} Original model
 */
export function getOriginalModel<T extends PureModel = PureModel>(model: T): T {
  const collection = getModelCollection(model);
  const originalId = getModelMetaKey(model, 'originalId');
  if (originalId) {
    if (!collection) {
      throw error(REF_NEEDS_COLLECTION);
    }

    return collection.find(model, originalId) as T;
  }
  throw error(NOT_A_CLONE);
}

/**
 * Bulk update the model data
 *
 * @export
 * @template T
 * @param {T} model Model to be updated
 * @param {IDictionary} data Data that should be assigned to the model
 * @returns {T}
 */
export function updateModel<T extends PureModel>(model: T, data: IDictionary): T {
  const modelId = storage.getModelClassMetaKey(model.constructor as typeof PureModel, 'id') || 'id';
  const modelType = storage.getModelClassMetaKey(model.constructor as typeof PureModel, 'type') || 'type';

  const keys = Object.keys(data instanceof PureModel ? modelToJSON(data) : data);
  startAction(model);
  keys.forEach((key) => {
    if (key !== META_FIELD && key !== modelId && key !== modelType) {
      assignModel(model, key, data[key]);
    }
  });
  endAction(model);

  return model;
}

/**
 * Assign a property to a model
 *
 * @export
 * @template T
 * @param {T} model A model to modify
 * @param {string} key Property name
 * @param {*} value Property value
 */
export function assignModel<T extends PureModel>(model: T, key: string, value: any): void {
  const refs = getModelMetaKey(model, 'refs') as IDictionary<IReferenceOptions>;
  startAction(model);
  if (key in refs) {
    assignModelRef(model, key, value);
  } else if (value instanceof PureModel) {
    endAction(model);
    throw error(NO_REFS, {key});
  } else {
    assignModelField(model, key, value);
  }
  endAction(model);
}

function assignModelField<T extends PureModel>(model: T, key: string, value: any): void {
  const fields = getModelMetaKey(model, 'fields') as Array<string>;
  if (fields.indexOf(key) !== -1) {
    model[key] = value;
  } else {
    initModelField(model, key, value);
  }
}

function assignModelRef<T extends PureModel>(model: T, key: string, value: TRefValue): void {
  // const refs = getModelMetaKey(model, 'refs');
  model[key] = value;
}

export function getMetaKeyFromRaw(data: IRawModel, key: string, model?: typeof PureModel): any {
  if (META_FIELD in data && typeof data[META_FIELD] === 'object' && data[META_FIELD] !== undefined) {
    return (data[META_FIELD] || {})[key];
  }
  if (model) {
    const modelId = storage.getModelClassMetaKey(model, key);

    return modelId && data[modelId];
  }

  return data && data[key];
}

/**
 * Get a serializable value of the model
 *
 * @export
 * @param {PureModel} model Model to serialize
 * @returns {IRawModel} Pure JS value of the model
 */
export function modelToJSON(model: PureModel): IRawModel {
  const data = toJS(storage.getModelData(model));

  const rawMeta = Object.assign({}, storage.getModelMeta(model));
  delete rawMeta.collection;
  delete rawMeta.patch;
  const meta = toJS(rawMeta);
  const refs = {};
  Object.keys(meta.refs || {}).forEach((key) => {
    refs[key] = {model: getModelType(meta.refs[key].model), type: meta.refs[key].type};
  });
  // console.log(meta.refs, Object.keys(meta.refs), refs)
  meta.refs = refs;

  delete meta.collection;

  const raw = Object.assign(data, {[META_FIELD]: meta});

  const staticModel = model.constructor as typeof PureModel;
  const modelId = storage.getModelClassMetaKey(staticModel, 'id');
  const modelType = storage.getModelClassMetaKey(staticModel, 'type');
  if (meta && modelId) {
    raw[modelId] = meta.id;
  }
  if (meta && modelType) {
    raw[modelType] = meta.type;
  }

  return raw;
}

export function getModelMetaKey(model: PureModel, key: string) {
  return storage.getModelMetaKey(model, key);
}

export function setModelMetaKey(model: PureModel, key: string, value: any) {
  storage.setModelMetaKey(model, key, value);

  return;
}

export function getModelClassRefs(type: typeof PureModel) {
  return storage.getModelClassReferences(type);
}
