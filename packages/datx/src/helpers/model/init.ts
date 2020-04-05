import { assignComputed, IRawModel, getMeta, mapItems, setMeta, META_FIELD } from 'datx-utils';
import { observable, isArrayLike } from 'mobx';

import { PureModel } from '../../PureModel';
import { PureCollection } from '../../PureCollection';
import { MetaClassField } from '../../enums/MetaClassField';
import { MetaModelField } from '../../enums/MetaModelField';
import { IFieldDefinition, IReferenceDefinition, ParsedRefModel } from '../../Attribute';
import { ReferenceType } from '../../enums/ReferenceType';
import {
  getModelType,
  getModelCollection,
  getModelId,
  isModelReference,
  modelMapParse,
} from './utils';
import { getBucketConstructor } from '../../buckets';
import { getRef, updateRef, getBackRef, updateBackRef } from './fields';
import { TRefValue } from '../../interfaces/TRefValue';
import { error } from '../format';
import { DEFAULT_ID_FIELD, DEFAULT_TYPE_FIELD } from '../../consts';
import { updateSingleAction } from '../patch';
import { IModelRef } from '../../interfaces/IModelRef';
import { IType } from '../../interfaces/IType';

type ModelFieldDefinitions = Record<string, IFieldDefinition>;

function getModelRefType(
  model: ParsedRefModel,
  data: any,
  parentModel: PureModel,
  key: string,
  collection?: PureCollection,
): IType {
  if (typeof model === 'function') {
    return getModelType(model(data, parentModel, key, collection));
  }

  return model;
}

export function initModelRef<T extends PureModel>(
  model: T,
  key: string,
  referenceDef?: IReferenceDefinition,
  initialVal?: TRefValue,
) {
  const fields = getMeta(model, MetaModelField.Fields, {});
  const fieldDef = fields[key] || { referenceDef };
  const collection = getModelCollection(model);

  if (!collection && initialVal) {
    throw error('The model needs to be in a collection to be referenceable');
  }

  if (referenceDef) {
    fields[key] = {
      referenceDef,
    };
  }

  if (fieldDef.referenceDef.property) {
    assignComputed(
      model,
      key,
      () => getBackRef(model, key),
      (value: TRefValue) => {
        updateBackRef(model, key, value);
      },
    );
  } else {
    const Bucket = getBucketConstructor(fieldDef.referenceDef.type);
    let value: IType | Array<IType> | null =
      fieldDef.referenceDef.type === ReferenceType.TO_MANY ? [] : null;

    if (initialVal) {
      value = mapItems(initialVal, (item) => {
        if (typeof item === 'object' && !isModelReference(item)) {
          return (
            collection?.add(
              item,
              getModelRefType(fieldDef.referenceDef.model, item, model, key, collection),
            ) || null
          );
        }

        if (typeof item === 'object' && isModelReference(item)) {
          return collection?.findOne(item as IModelRef) || null;
        }

        return (
          collection?.findOne(
            getModelRefType(fieldDef.referenceDef.model, item, model, key, collection),
            item,
          ) || null
        );
      });
    }

    const bucket = new Bucket(value, collection, false, model, key, true);

    updateSingleAction(model, key, bucket.value);
    setMeta(model, `ref_${key}`, bucket);

    assignComputed(
      model,
      key,
      () => getRef(model, key),
      (newValue: TRefValue) => {
        updateSingleAction(model, key, newValue);
        updateRef(model, key, newValue);
      },
    );
  }
}

function isPojo(val: any): boolean {
  return typeof val === 'object' && val !== null && !(val instanceof PureModel);
}

export function initModelField<T extends PureModel>(model: T, key: string, value: any): void {
  const fields = getMeta(model, MetaModelField.Fields, {});
  const fieldDef = fields[key];

  const typeField = getMeta(model.constructor, MetaClassField.TypeField, DEFAULT_TYPE_FIELD, true);
  const idField = getMeta(model.constructor, MetaClassField.IdField, DEFAULT_ID_FIELD, true);

  if (key === typeField) {
    assignComputed(
      model,
      key,
      () => getModelType(model),
      () => {
        throw error("Model type can't be changed after initialization.");
      },
    );
  } else if (key === idField) {
    assignComputed(
      model,
      key,
      () => getModelId(model),
      () => {
        throw error(
          "Model ID can't be updated directly. Use the `updateModelId` helper function instead.",
        );
      },
    );
  } else if (fieldDef.referenceDef) {
    initModelRef(model, key, undefined, value);
  } else {
    assignComputed(
      model,
      key,
      () => getMeta(model, `data__${key}`),
      (newValue: any) => {
        // Make sure nested properties are observable
        const packedValue = isPojo(newValue) ? observable(newValue) : newValue;

        updateSingleAction(model, key, newValue);
        setMeta(model, `data__${key}`, packedValue);
      },
    );
    // eslint-disable-next-line no-param-reassign
    model[key] = value;
  }
}

export function initModel(instance: PureModel, rawData: IRawModel, collection?: PureCollection) {
  const modelClass = instance.constructor as typeof PureModel;
  const modelClassFields: ModelFieldDefinitions = getMeta(
    instance.constructor,
    MetaClassField.Fields,
    {},
    true,
    true,
  );
  const modelMeta: ModelFieldDefinitions | undefined = rawData?.[META_FIELD];
  const fields: ModelFieldDefinitions = Object.assign({}, modelClassFields, modelMeta?.fields);

  setMeta(instance, MetaModelField.Collection, collection);

  const typeField = getMeta(
    instance.constructor,
    MetaClassField.TypeField,
    DEFAULT_TYPE_FIELD,
    true,
  );

  setMeta(
    instance,
    MetaModelField.TypeField,
    rawData[typeField] || modelMeta?.type || modelClass.type,
  );

  const idField = getMeta(instance.constructor, MetaClassField.IdField, DEFAULT_ID_FIELD, true);

  setMeta(
    instance,
    MetaModelField.IdField,
    rawData[idField] || modelMeta?.id || modelClass.getAutoId(),
  );

  setMeta(instance, MetaModelField.OriginalId, modelMeta?.originalId);

  Object.keys(rawData)
    .filter((field) => field !== META_FIELD)
    .filter((field) => !(field in fields)) // Only new fields
    .forEach((field) => {
      const value = rawData[field];
      const isRef =
        value instanceof PureModel ||
        (isArrayLike(value) && (value[0] instanceof PureModel || isModelReference(value[0]))) ||
        isModelReference(value);

      fields[field] = {
        referenceDef: isRef
          ? {
              type: ReferenceType.TO_ONE_OR_MANY,
              model: getModelType(value),
            }
          : false,
      };
    });

  setMeta(instance, MetaModelField.Fields, fields);

  Object.keys(fields).forEach((fieldName) => {
    const fieldDef = fields[fieldName];

    const data = {
      [fieldName]: fieldDef.defaultValue,
      ...rawData,
    };

    initModelField(instance, fieldName, modelMapParse(modelClass, data, fieldName));
  });
}
