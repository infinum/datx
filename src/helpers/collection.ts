import {Collection} from '../Collection';
import {OBJECT_NO_TYPE, UNDEFINED_MODEL, UNDEFINED_TYPE} from '../errors';
import {IRawModel} from '../interfaces/IRawModel';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';
import {storage} from '../services/storage';
import {error} from './format';
import {getMetaKeyFromRaw, updateModel} from './model/utils';

function initCollectionModel(collection: typeof Collection, data: IRawModel, index: number): Model {
  const type = getMetaKeyFromRaw(data, 'type');
  if (type) {
    return upsertModel(data, type, collection);
  }
  throw error(OBJECT_NO_TYPE, {index});
}

export function upsertModel(data: IRawModel, type: IType|typeof Model, collection: typeof Collection): Model {
  const TypeModel = collection.types.find((item) => item.type === type);

  if (!type) {
    throw error(UNDEFINED_TYPE);
  }

  if (!TypeModel) {
    throw error(UNDEFINED_MODEL, {type});
  }

  const id = getMetaKeyFromRaw(data, 'id');
  if (id) {
    const existingModel = storage.findModel(type, id);
    if (existingModel) {
      return updateModel(existingModel, data);
    }
  }

  return new TypeModel(data);
}

export function isSelectorFunction(fn: any) {
  return (typeof fn === 'function') && (fn !== Model && !(fn.prototype instanceof Model));
}

export function initModels(collection: Collection, data: Array<IRawModel> = []) {
  const staticCollection = collection.constructor as typeof Collection;
  return data.map((item, index) => initCollectionModel(staticCollection, item, index));
}
