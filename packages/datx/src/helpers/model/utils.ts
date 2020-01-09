import {
  getMeta,
  IRawModel,
  META_FIELD,
  warn,
  setMeta,
  mergeMeta,
  getMetaObj,
  isArray,
} from 'datx-utils';

import { IModelRef } from '../../interfaces/IModelRef';
import { IType } from '../../interfaces/IType';
import { MetaModelField } from '../../enums/MetaModelField';
import { PureModel } from '../../PureModel';
import { PureCollection } from '../../PureCollection';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { startAction, endAction } from '../patch';
import { MetaClassField } from '../../enums/MetaClassField';
import { initModelField } from './init';
import { IFieldDefinition } from '../../Attribute';
import { IBucket } from '../../interfaces/IBucket';
import { error } from '../format';

export function isModelReference(value: IModelRef | Array<IModelRef>): true;
export function isModelReference(value: unknown): false;
export function isModelReference(value: unknown): boolean {
  if (isArray(value)) {
    return (value as Array<IModelRef>).every(isModelReference);
  }

  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    'id' in value &&
    Object.keys(value).length === 2
  );
}

/**
 * Get the type of the given model
 *
 * @export
 * @param {(IType|typeof PureModel|PureModel)} model Model to be checked
 * @returns {IType} Model type
 */
export function getModelType(model: IType | IModelRef | typeof PureModel | PureModel): IType {
  if (typeof model === 'function') {
    return (model as typeof PureModel).type;
  } else if (isModelReference(model)) {
    return (model as IModelRef).type;
  } else if (typeof model === 'object') {
    return getMeta(model, MetaModelField.TypeField) || (model.constructor as typeof PureModel).type;
  }

  return model;
}

export function getModelId(model: PureModel | IIdentifier): IIdentifier {
  if (model instanceof PureModel) {
    const id = getMeta<IIdentifier>(model, MetaModelField.IdField);
    if (id !== undefined) {
      return id;
    }
    throw error('Model without an ID');
  }

  return model;
}

export function getModelCollection(model: PureModel): PureCollection | undefined {
  return getMeta<PureCollection>(model, MetaModelField.Collection);
}

export function isReference(model: PureModel | IModelRef): boolean {
  return !(model instanceof PureModel);
}

export function getModelRef(model: PureModel | IModelRef): IModelRef {
  if (model instanceof PureModel) {
    return {
      id: getModelId(model),
      type: getModelType(model),
    };
  }

  return model;
}

export function modelToJSON(model: PureModel): IRawModel {
  const meta = getMetaObj(model);
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  const raw = {
    [META_FIELD]: {
      ...meta,
      [MetaModelField.IdField]: getModelId(model),
      [MetaModelField.TypeField]: getModelType(model),
      [MetaModelField.Collection]: undefined,
    },
  };

  Object.keys(fields).forEach((fieldName) => {
    const fieldDef = fields[fieldName];

    if (fieldDef.referenceDef) {
      const bucket = getMeta<IBucket<PureModel>>(model, `ref_${fieldName}`);
      raw[fieldName] = bucket?.snapshot || null;
    } else {
      raw[fieldName] = model[fieldName];
    }
  });

  return raw;
}

export function cloneModel<T extends PureModel>(model: T): T {
  const rawData = modelToJSON(model);
  const meta = rawData[META_FIELD] || {};
  meta[MetaModelField.OriginalId] = meta[MetaModelField.IdField];
  delete meta[MetaModelField.IdField];

  const collection = getModelCollection(model);
  if (collection) {
    const modelType = getModelType(model);

    return collection.add(rawData, modelType);
  } else {
    const TypeModel = model.constructor as typeof PureModel;
    warn(`The model is not in the collection. Referencing the original model won't be possible`);

    return new TypeModel(rawData) as T;
  }
}

export function getOriginalModel<T extends PureModel = PureModel>(model: T): T {
  const collection = getModelCollection(model);
  const originalId = getMeta<IIdentifier>(model, MetaModelField.OriginalId);
  if (originalId) {
    if (!collection) {
      throw error('The model needs to be in a collection to be referenceable');
    }

    return collection.findOne(model, originalId) as T;
  }
  throw error('The given model is not a clone.');
}

const READ_ONLY_META: Array<string> = [
  MetaModelField.Fields,
  MetaModelField.IdField,
  MetaModelField.TypeField,
];

function omitKeys(obj: object, keys: Array<string>): object {
  const newObj = {};

  Object.keys(obj)
    .filter((key) => !keys.includes(key))
    .forEach((key) => (newObj[key] = obj[key]));

  return newObj;
}

export function updateModel<T extends PureModel>(model: T, data: Record<string, any>): T {
  const modelId = getMeta(model.constructor, MetaClassField.IdField, 'id');
  const modelType = getMeta(model.constructor, MetaClassField.TypeField, 'type');

  const keys = Object.keys(data instanceof PureModel ? modelToJSON(data) : data);
  mergeMeta(model, omitKeys(data[META_FIELD] || {}, READ_ONLY_META));
  startAction(model);

  keys.forEach((key) => {
    if (key !== META_FIELD && key !== modelId && key !== modelType) {
      assignModel(model, key, data[key]);
    } else if (key === META_FIELD) {
      const metaKeys = Object.keys(data[key] || {});
      metaKeys.forEach((metaKey) => {
        if (!READ_ONLY_META.includes(metaKey)) {
          setMeta(model, metaKey, data[key][metaKey]);
        }
      });
    }
  });
  endAction(model);

  return model;
}

export function assignModel<T extends PureModel>(model: T, key: string, value: any): void {
  if (!(model instanceof PureModel)) {
    throw error('The given parameter is not a valid model');
  }
  const fields = getMeta(model, MetaModelField.Fields, {});

  if (key in fields) {
    model[key] = value;
  } else {
    initModelField(model, key, value);
  }
}

export function updateModelCollection(model: PureModel, collection?: PureCollection) {
  setMeta(model, MetaModelField.Collection, collection);

  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  startAction(model);
  for (const key of Object.keys(fields)) {
    const bucket = getMeta(model, `ref_${key}`);
    if (bucket) {
      bucket.setCollection(collection);
    }
  }
  endAction(model);
}
