import {Collection} from '../Collection';
import {UNDEFINED_MODEL, UNDEFINED_TYPE} from '../errors';
import {IRawModel} from '../interfaces/IRawModel';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';
import {storage} from '../services/storage';
import {error} from './format';
import {getMetaKeyFromRaw, updateModel} from './model/utils';

function initCollectionModel(collection: Collection, data: IRawModel): Model {
  const type = getMetaKeyFromRaw(data, 'type');
  return upsertModel(data, type, collection);
}

export function upsertModel(data: IRawModel, type: IType|typeof Model, collection: Collection): Model {
  const staticCollection = collection.constructor as typeof Collection;
  const TypeModel = staticCollection.types.find((item) => item.type === type);

  if (!type) {
    throw error(UNDEFINED_TYPE);
  }

  if (!TypeModel) {
    throw error(UNDEFINED_MODEL, {type});
  }

  const id = getMetaKeyFromRaw(data, 'id');
  const existingModel = id === undefined ? id : collection.find(type, id);
  if (existingModel) {
    return updateModel(existingModel, data);
  }

  return new TypeModel(data, collection);
}

export function isSelectorFunction(fn: any) {
  return (typeof fn === 'function') && (fn !== Model && !(fn.prototype instanceof Model));
}

export function initModels(collection: Collection, data: Array<IRawModel>) {
  return data.map((item) => initCollectionModel(collection, item));
}
