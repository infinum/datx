import { IRawModel, META_FIELD } from 'datx-utils';

import { IType } from '../interfaces/IType';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { error } from './format';
import { updateModel } from './model/utils';
import { MetaModelField } from '../enums/MetaModelField';

function initCollectionModel(collection: PureCollection, data: IRawModel): PureModel {
  const type = data?.[META_FIELD]?.[MetaModelField.TypeField];

  return upsertModel(data, type, collection);
}

export function upsertModel(
  data: IRawModel,
  type: number | IType | typeof PureModel,
  collection: PureCollection,
): PureModel {
  if (!type && type !== 0) {
    throw error('The type needs to be defined if the object is not an instance of the model.');
  }

  const staticCollection = collection.constructor as typeof PureCollection;
  const TypeModel = staticCollection.types.find((item) => item.type === type);
  if (!TypeModel) {
    const DefaultModel = staticCollection.defaultModel;
    if (DefaultModel) {
      return new DefaultModel(
        {
          ...data,
          [META_FIELD]: {
            ...(data[META_FIELD] || {}),
            type,
          },
        },
        collection,
      );
    }
    throw error(`No model is defined for the type ${type}.`);
  }

  const id = data?.[META_FIELD]?.[MetaModelField.IdField];
  const existingModel = id && collection.findOne(type, id);
  if (existingModel) {
    return updateModel(existingModel, data);
  }

  return new TypeModel(data, collection);
}

export function isSelectorFunction(fn: any) {
  return typeof fn === 'function' && fn !== PureModel && !(fn.prototype instanceof PureModel);
}

export function initModels(collection: PureCollection, data: Array<IRawModel>) {
  return data.map((item) => initCollectionModel(collection, item));
}
