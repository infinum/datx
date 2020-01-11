import {
  assignComputed,
  IRawModel,
  getMeta,
  mapItems,
  setMeta,
  META_FIELD,
  isArray,
} from 'datx-utils';
import { reaction, set } from 'mobx';

import { PureModel } from '../../PureModel';
import { PureCollection } from '../../PureCollection';
import { MetaClassField } from '../../enums/MetaClassField';
import { MetaModelField } from '../../enums/MetaModelField';
import { IFieldDefinition, IReferenceDefinition } from '../../Attribute';
import { ReferenceType } from '../../enums/ReferenceType';
import { getModelType, getModelCollection, getModelId } from './utils';
import { IType } from '../../interfaces/IType';
import { getBucketConstructor } from '../../buckets';
import { getRef, updateRef, getBackRef, updateBackRef } from './fields';
import { TRefValue } from '../../interfaces/TRefValue';
import { error } from '../format';
import { DEFAULT_ID_FIELD, DEFAULT_TYPE_FIELD } from '../../consts';
import { startAction, endAction, updateAction } from '../patch';

type ModelFieldDefinitions = Record<string, IFieldDefinition>;

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
    const type = fieldDef.referenceDef.models[0];
    const Bucket = getBucketConstructor(fieldDef.referenceDef.type);
    setMeta(
      model,
      `ref_${key}`,
      // @ts-ignore
      new Bucket(collection?.add(initialVal, type), collection, false, model, key),
    );

    assignComputed(
      model,
      key,
      () => getRef(model, key),
      (value: TRefValue) => {
        updateRef(model, key, value);
      },
    );
  }
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
    set(model, key, value);
    reaction(
      () => model[key],
      (newValue: any) => {
        startAction(model);
        updateAction(model, key, newValue);
        endAction(model);
      },
    );
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
      const isRef = value instanceof PureModel || (isArray(value) && value[0] instanceof PureModel);
      fields[field] = {
        referenceDef: isRef
          ? {
              type: ReferenceType.TO_ONE_OR_MANY,
              models: ([] as Array<IType>).concat(mapItems<PureModel, IType>(value, getModelType)),
            }
          : false,
      };
    });

  setMeta(instance, MetaModelField.Fields, fields);

  Object.keys(fields).forEach((fieldName) => {
    const fieldDef = fields[fieldName];

    const value = fieldName in rawData ? rawData[fieldName] : fieldDef.defaultValue;
    initModelField(instance, fieldName, value);
  });
}
