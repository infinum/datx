import {
  getMeta,
  IRawModel,
  META_FIELD,
  warn,
  setMeta,
  mergeMeta,
  getMetaObj,
  mapItems,
  isArrayLike,
  mobx,
} from '@datx/utils';

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
import { ReferenceType } from '../../enums/ReferenceType';
import { DEFAULT_ID_FIELD, DEFAULT_TYPE_FIELD } from '../../consts';

const defaultParseSerializeFn = (value: any, _data: any): any => value;

export function modelMapParse(modelClass: typeof PureModel, data: object, key: string): any {
  const parseFn = getMeta(
    modelClass,
    `${MetaClassField.MapParse}_${key}`,
    defaultParseSerializeFn,
    true,
  );

  return parseFn(data[key], data);
}

export function modelMapSerialize(modelClass: typeof PureModel, data: object, key: string): any {
  const parseFn = getMeta(
    modelClass,
    `${MetaClassField.MapSerialize}_${key}`,
    defaultParseSerializeFn,
    true,
  );

  return parseFn(data[key], data);
}

export function isModelReference(value: IModelRef | Array<IModelRef>): true;
export function isModelReference(value: unknown): false;
export function isModelReference(value: unknown): boolean {
  if (isArrayLike(value)) {
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

export function isIdentifier(value: any): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

export function peekNonNullish(...args: Array<any>): any {
  if (args.length === 0) return null;

  let i = -1;
  while (++i < args.length) {
    let arg = args[i];

    if (typeof arg === 'function') {
      arg = arg();
    }
    if (arg !== null && arg !== undefined) {
      return arg;
    }
  }
  return null;
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
  }

  if (isModelReference(model)) {
    return (model as IModelRef).type;
  }

  if (typeof model === 'object') {
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

const INTERNAL_META = [
  MetaModelField.Patch,
  MetaModelField.PatchListeners,
  MetaModelField.Collection,
  MetaModelField.Commit,
  MetaModelField.OriginalId,
  'get__',
  'set__',
  'data__',
  'ref_',
];

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries
function fromEntries(entries: Array<[string, any]>): Record<string, any> {
  const data = {};

  entries.forEach(([key, value]: [string, any]) => {
    data[key] = value;
  });

  return data;
}

function getRawData(input: unknown) {
  try {
    if (Array.isArray(input)) {
      return input.map(getRawData);
    }

    if (typeof input === 'object') {
      const data = {};

      for (const key in input) {
        // skip parent properties
        if (!Object.prototype.hasOwnProperty.call(input, key)) continue;

        const isParsable = typeof input[key] === 'object' || Array.isArray(input[key]);

        if (input[key] && isParsable) {
          data[key] = getRawData(input[key]);
        } else {
          data[key] = input[key];
        }
      }

      return Object.setPrototypeOf(data, null);
    }

    return input;
  } catch (e) {
    return input;
  }
}

export function modelToJSON(model: PureModel): IRawModel {
  const meta = getMetaObj(model);
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  const metaKeys = Object.keys(meta).filter(
    (key) => !INTERNAL_META.some((match) => key.startsWith(match)),
  );
  const raw = {
    [META_FIELD]: Object.assign({}, fromEntries(metaKeys.map((key) => [key, meta[key]])), {
      [MetaModelField.IdField]: getModelId(model),
      [MetaModelField.TypeField]: getModelType(model),
      [MetaModelField.Collection]: undefined,
    }),
  };

  Object.keys(fields).forEach((fieldName) => {
    const fieldDef = fields[fieldName];

    if (fieldDef.referenceDef) {
      const bucket = getMeta<IBucket<PureModel>>(model, `ref_${fieldName}`);

      raw[fieldName] = bucket?.snapshot || null;
    } else {
      raw[fieldName] = modelMapSerialize(model.constructor as typeof PureModel, model, fieldName);
    }
  });

  // return mobx.toJS(raw);
  return getRawData(raw);
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
  }
  const TypeModel = model.constructor as typeof PureModel;

  warn(`The model is not in the collection. Referencing the original model won't be possible`);

  return new TypeModel(rawData) as T;
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
    .forEach((key) => {
      newObj[key] = obj[key];
    });

  return newObj;
}

export function assignModel<T extends PureModel>(model: T, key: string, value: any): void {
  mobx.runInAction(() => {
    if (!(model instanceof PureModel)) {
      throw error('The given parameter is not a valid model');
    }
    const fields: Record<string, IFieldDefinition> = getMeta(model, MetaModelField.Fields, {});
    const shouldBeReference =
      (isArrayLike(value) && value.length > 0 && value[0] instanceof PureModel) ||
      value instanceof PureModel;

    if (key in fields) {
      if (shouldBeReference && !fields[key].referenceDef) {
        throw error('You should save this value as a reference.');
      }
      // model[key] = shouldBeReference ? value : getRawData(value);
      model[key] = value;
    } else {
      if (shouldBeReference) {
        mobx.extendObservable(fields, {
          [key]: {
            referenceDef: {
              type: ReferenceType.TO_ONE_OR_MANY,
              models: Array.from(new Set<IType>(mapItems<PureModel, IType>(value, getModelType))),
            },
          },
        });
      } else {
        mobx.extendObservable(fields, {
          [key]: {
            referenceDef: false,
          },
        });
      }
      setMeta(model, MetaModelField.Fields, fields);
      initModelField(model, key, value);
    }
  });
}

export function updateModel<T extends PureModel>(model: T, data: Record<string, any>): T {
  startAction(model);
  const rawData = getRawData(data);
  const modelId = getMeta(model.constructor, MetaClassField.IdField, DEFAULT_ID_FIELD);
  const modelType = getMeta(model.constructor, MetaClassField.TypeField, DEFAULT_TYPE_FIELD);

  mergeMeta(model, omitKeys(rawData[META_FIELD] || {}, READ_ONLY_META));

  Object.keys(rawData).forEach((key) => {
    if (key !== META_FIELD && key !== modelId && key !== modelType) {
      assignModel(model, key, rawData[key]);
    } else if (key === META_FIELD) {
      const metaKeys = Object.keys(rawData[key] || {});

      metaKeys.forEach((metaKey) => {
        if (!READ_ONLY_META.includes(metaKey)) {
          setMeta(model, metaKey, rawData[key][metaKey]);
        }
      });
    }
  });
  endAction(model);

  return model;
}

export function updateModelCollection(model: PureModel, collection?: PureCollection): void {
  setMeta(model, MetaModelField.Collection, collection);

  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});

  startAction(model);
  Object.keys(fields).forEach((key) => {
    const bucket = getMeta(model, `ref_${key}`);

    if (bucket) {
      bucket.setCollection(collection);
    }
  });
  endAction(model);
}

export function commitModel(model: PureModel): void {
  setMeta(model, MetaModelField.Commit, { ...modelToJSON(model), __META__: undefined });
}

export function revertModel(model: PureModel): void {
  const prevCommit: IRawModel | undefined = getMeta(model, MetaModelField.Commit);

  if (prevCommit) {
    updateModel(model, prevCommit);
  }
}

function isSame(valA: any, valB: any): boolean {
  return JSON.stringify(valA) === JSON.stringify(valB); // TODO: better comparison?
}

export function isAttributeDirty<T extends PureModel>(model: T, key: keyof T): boolean {
  const prevCommit: IRawModel | undefined = getMeta(model, MetaModelField.Commit);

  if (prevCommit) {
    const fields: Record<string, IFieldDefinition> = getMeta(model, MetaModelField.Fields, {});
    const field = fields[key as string];

    if (field === undefined) {
      return false;
    }

    const value = field.referenceDef ? mapItems(model[key], getModelRef) : model[key];
    return !isSame(value, prevCommit[key as string]);
  }

  return true;
}

export function modelToDirtyJSON<T extends PureModel>(model: T): IRawModel {
  const raw = { ...modelToJSON(model) };

  Object.keys(model).forEach((key) => {
    if (!isAttributeDirty(model, key as keyof T)) {
      delete raw[key];
    }
  });

  return raw;
}
