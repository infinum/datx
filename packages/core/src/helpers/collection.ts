import { IRawModel, META_FIELD, getMeta } from '@datx/utils';

import { IType } from '../interfaces/IType';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { error } from './format';
import { modelMapParse, updateModel } from './model/utils';
import { MetaModelField } from '../enums/MetaModelField';
import { MetaClassField } from '../enums/MetaClassField';

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
        Object.assign({}, data, {
          [META_FIELD]: Object.assign({}, data[META_FIELD] || {}, { type }),
        }),
        collection,
      );
    }
    throw error(`No model is defined for the type ${type}.`);
  }

  const metaId = data?.[META_FIELD]?.[MetaModelField.IdField];
  const idField = getMeta(TypeModel, MetaClassField.IdField);
  const id = idField ? data?.[idField] ?? metaId : metaId;
  const existingModel = id && collection.findOne(type, id);

  if (existingModel) {
    const fields = getMeta(TypeModel, MetaClassField.Fields);
    const keys = Object.keys({ ...data, ...fields });
    const parsedData = {};

    keys.forEach((key: string) => {
      const isBackRefKey = Boolean(fields[key]?.referenceDef?.property);
      const result = modelMapParse(TypeModel, data, key);
      if (!(isBackRefKey && result === undefined && !(key in data))) {
        parsedData[key] = result;
      }
    });
    return updateModel(existingModel, parsedData);
  }

  return new TypeModel(TypeModel.preprocess(data), collection);
}

function initCollectionModel(collection: PureCollection, data: IRawModel): PureModel {
  const type = data?.[META_FIELD]?.[MetaModelField.TypeField];

  return upsertModel(data, type, collection);
}

export function isSelectorFunction(fn: any): boolean {
  return typeof fn === 'function' && fn !== PureModel && !(fn.prototype instanceof PureModel);
}

export function initModels(collection: PureCollection, data: Array<IRawModel>): Array<PureModel> {
  return data.map((item) => initCollectionModel(collection, item));
}
