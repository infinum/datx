import { getMeta, setMeta, mapItems } from '@datx/utils';

import { PureModel } from '../../PureModel';
import { IBucket } from '../../interfaces/IBucket';
import { TRefValue } from '../../interfaces/TRefValue';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { getModelRefType } from './init';
import { getModelCollection, getModelId, getModelRef, getModelType, isIdentifier } from './utils';
import { IFieldDefinition, IReferenceDefinition } from '../../Field';
import { MetaModelField } from '../../enums/MetaModelField';
import { MetaClassField } from '../../enums/MetaClassField';
import { IType } from '../../interfaces/IType';
import { error } from '../format';
import { IModelRef } from '../../interfaces/IModelRef';

export function getRef(model: PureModel, key: string): PureModel | Array<PureModel> | null {
  const value: IBucket<PureModel> | undefined = getMeta(model, `ref_${key}`);

  return value ? value.value : null;
}

export function getRefId(model: PureModel, key: string): IModelRef | Array<IModelRef> | null {
  const value: IBucket<PureModel> | undefined = getMeta(model, `ref_${key}`);

  return value ? value.refValue : null;
}

export function updateRef(
  model: PureModel,
  key: string,
  value: TRefValue,
): PureModel | Array<PureModel> | null {
  const bucket: IBucket<PureModel> | undefined = getMeta(model, `ref_${key}`);

  if (isIdentifier(value) || Array.isArray(value)) {
    const fieldDef = getMeta(model, MetaModelField.Fields, {})[key];
    const type = getModelRefType(
      fieldDef.referenceDef.model,
      fieldDef.referenceDef.defaultValue,
      model,
      key,
      getModelCollection(model),
    );

    value = mapItems(value, (v: IIdentifier | IModelRef | PureModel) =>
      isIdentifier(v) ? { id: v, type } : getModelRef(v),
    );
  }

  return bucket ? (bucket.value = value) : null;
}

function getModelRefsByType(model: PureModel, type: IType): Array<string> {
  const fields = getMeta<Record<string, IFieldDefinition>>(
    model,
    MetaClassField.Fields,
    {},
    true,
    true,
  );

  return Object.keys(fields)
    .filter((key) => fields[key].referenceDef)
    .filter((key) => !(fields[key].referenceDef as IReferenceDefinition).property)
    .filter((key) => (fields[key].referenceDef as IReferenceDefinition).model === type);
}

function updateModelReferences(
  model: PureModel,
  newId: IIdentifier,
  oldId: IIdentifier,
  type: IType,
): void {
  const collection = getModelCollection(model);

  if (collection) {
    collection.getAllModels().forEach((item) => {
      getModelRefsByType(item, type)
        .map((ref) => getMeta(item, `ref_${ref}`))
        .filter(Boolean)
        .forEach((bucket: IBucket<PureModel>) => {
          if (Array.isArray(bucket.value)) {
            const targetIndex = (bucket.value as Array<PureModel>).findIndex(
              (modelItem) => getModelId(modelItem) === oldId && getModelType(modelItem) === type,
            );

            if (targetIndex !== -1) {
              (bucket.value as Array<PureModel>)[targetIndex] = newId;
            }
          } else if (
            bucket.value &&
            getModelId(bucket.value) === oldId &&
            getModelType(bucket.value) === type
          ) {
            bucket.value = {
              id: newId,
              type,
            };
          }
        });
    });
  }
}

export function updateModelId(model: PureModel, newId: IIdentifier): void {
  const collection = getModelCollection(model);

  const oldId = getModelId(model);
  const type = getModelType(model);

  setMeta(model, MetaModelField.IdField, newId);

  if (collection) {
    // @ts-ignore - I'm bad and I should feel bad...
    collection.__changeModelId(oldId, newId, type);
  }

  updateModelReferences(model, newId, oldId, type);
}

function hasBackRef(item: PureModel, property: string, target: PureModel): boolean {
  if (item[property] === null || item[property] === undefined) {
    return false;
  }

  if (item[property] instanceof PureModel) {
    return item[property] === target;
  }

  return item[property].includes(target);
}

export function getBackRef(model: PureModel, key: string): PureModel | Array<PureModel> | null {
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  const refOptions = fields[key]?.referenceDef;

  if (!refOptions || !refOptions.property) {
    return null;
  }

  const collection = getModelCollection(model);

  if (!collection) {
    return null;
  }

  const backModels = collection
    .getAllModels()
    .filter((item) => hasBackRef(item, refOptions.property as string, model));

  const backData: Array<PureModel> = backModels.slice();

  return backData;
}

export function updateBackRef(_model: PureModel, _key: string, _value: TRefValue): void {
  throw error('Back references are read only');
}
