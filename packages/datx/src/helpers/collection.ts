import {IRawModel} from 'datx-utils';

import {UNDEFINED_MODEL, UNDEFINED_TYPE} from '../errors';
import {IType} from '../interfaces/IType';
import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';
import {storage} from '../services/storage';
import {error} from './format';
import {getMetaKeyFromRaw, updateModel} from './model/utils';

function initCollectionModel(collection: PureCollection, data: IRawModel): PureModel {
  const type = getMetaKeyFromRaw(data, 'type');
  return upsertModel(data, type, collection);
}

export function upsertModel(data: IRawModel, type: IType|typeof PureModel, collection: PureCollection): PureModel {
  if (!type) {
    throw error(UNDEFINED_TYPE);
  }

  const staticCollection = collection.constructor as typeof PureCollection;
  const TypeModel = staticCollection.types.find((item) => item.type === type) || staticCollection.defaultModel;
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
  return (typeof fn === 'function') && (fn !== PureModel && !(fn.prototype instanceof PureModel));
}

export function initModels(collection: PureCollection, data: Array<IRawModel>) {
  return data.map((item) => initCollectionModel(collection, item));
}
