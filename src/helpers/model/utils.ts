import {toJS} from 'mobx';

import {Collection} from '../../Collection';
import {META_FIELD} from '../../consts';
import {NO_REFS, NOT_A_CLONE} from '../../errors';
import {IDictionary} from '../../interfaces/IDictionary';
import {IIdentifier} from '../../interfaces/IIdentifier';
import {IRawModel} from '../../interfaces/IRawModel';
import {IReferenceOptions} from '../../interfaces/IReferenceOptions';
import {IType} from '../../interfaces/IType';
import {TRefValue} from '../../interfaces/TRefValue';
import {Model} from '../../Model';
import {storage} from '../../services/storage';
import {error} from '../format';
import {initModelField} from '../model/init';

/**
 * Get the model type
 *
 * @export
 * @param {(IType|typeof Model|Model)} model Model to be checked
 * @returns {IType} Model type
 */
export function getModelType(model: IType|typeof Model|Model): IType {
  if (typeof model === 'function') {
    return model.type;
  } else if (typeof model === 'object') {
    return storage.getModelDataKey(model, 'type') || (model.constructor as typeof Model).type;
  }
  return model;
}

/**
 * Get the model identifier
 *
 * @export
 * @param {(Model|IIdentifier)} model Model to be checked
 * @returns {IIdentifier} Model identifier
 */
export function getModelId(model: Model|IIdentifier): IIdentifier {
  if (model instanceof Model) {
    return storage.getModelMetaKey(model, 'id');
  }
  return model;
}

/**
 * Get a list of collections the given model belongs to
 *
 * @export
 * @param {Model} model Model to be checked
 * @returns {Array<Collection>} A list of collections the given model belongs to
 */
export function getModelCollections(model: Model): Array<Collection> {
  return storage.getModelCollections(model);
}

/**
 * Clone the given model
 *
 * @export
 * @template T
 * @param {T} model Model to be clones
 * @returns {T} Cloned model object
 */
export function cloneModel<T extends Model>(model: T): T {
  const TypeModel = model.constructor as typeof Model;
  const rawData = modelToJSON(model);
  const meta = (rawData[META_FIELD] as IDictionary<any>);
  meta.originalId = meta.id;
  delete meta.id;

  // TODO: Warning if model is not in a collection

  return new TypeModel(rawData) as T;
}

/**
 * Get the original model for the cloned model
 *
 * @export
 * @param {Model} model Cloned model
 * @returns {Model} Original model
 */
export function getOriginalModel(model: Model): Model {
  const originalId = storage.getModelMetaKey(model, 'originalId');
  if (originalId) {
    return storage.findModel(model, originalId) as Model;
  }
  throw error(NOT_A_CLONE);
}

/**
 * Bulk update the model data
 *
 * @export
 * @template T
 * @param {T} model Model to be updated
 * @param {IDictionary<any>} data Data that should be assigned to the model
 * @returns {T}
 */
export function updateModel<T extends Model>(model: T, data: IDictionary<any>): T {
  const modelId = storage.getModelClassMetaKey(model.constructor as typeof Model, 'id');
  const modelType = storage.getModelClassMetaKey(model.constructor as typeof Model, 'id');

  Object.keys(data).forEach((key) => {
    if (key !== META_FIELD && key !== modelId && key !== modelType) {
      assignModel(model, key, data[key]);
    }
  });
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

function assignModelRef<T extends Model>(model: T, key: string, value: TRefValue): void {
  const refs = storage.getModelMetaKey(model, 'refs');
  model[key] = value;
}

export function getMetaKeyFromRaw(data: IRawModel, key: string): any {
  if (META_FIELD in data && typeof data[META_FIELD] === 'object' && data[META_FIELD] !== undefined) {
    return (data[META_FIELD] as IDictionary<any>)[key];
  }
  return undefined;
}

/**
 * Get a serializable value of the model
 *
 * @export
 * @param {Model} model Model to serialize
 * @returns {IRawModel} Pure JS value of the model
 */
export function modelToJSON(model: Model): IRawModel {
  const data = toJS(storage.getModelData(model));
  const meta = toJS(storage.getModelMeta(model));

  const raw = Object.assign(data, {[META_FIELD]: meta});

  const staticModel = model.constructor as typeof Model;
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
