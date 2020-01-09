import { getMeta, setMeta, isArray } from 'datx-utils';

import { PureModel } from '../../PureModel';
import { IBucket } from '../../interfaces/IBucket';
import { TRefValue } from '../../interfaces/TRefValue';
import { runInAction, isObservableArray } from 'mobx';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { getModelCollection, getModelId } from './utils';
import { getModelType } from '../..';
import { IFieldDefinition, IReferenceDefinition } from '../../Attribute';
import { MetaModelField } from '../../enums/MetaModelField';
import { MetaClassField } from '../../enums/MetaClassField';
import { IType } from '../../interfaces/IType';

export function getRef(model: PureModel, key: string): PureModel | Array<PureModel> | null {
  const value: IBucket<PureModel> | undefined = getMeta(model, `ref_${key}`);

  return value ? value.value : null;
}

export function updateRef(
  model: PureModel,
  key: string,
  value: TRefValue,
): PureModel | Array<PureModel> | null {
  const bucket: IBucket<PureModel> | undefined = getMeta(model, `ref_${key}`);

  if (bucket) {
    bucket.value = value;

    return bucket.value;
  }
  return null;
}

export function updateModelId(model: PureModel, newId: IIdentifier): void {
  runInAction(() => {
    const collection = getModelCollection(model);

    const oldId = getModelId(model);
    const type = getModelType(model);
    setMeta(model, MetaModelField.IdField, newId);

    if (collection) {
      // @ts-ignore - I'm bad and I should feel bad...
      collection.__changeModelId(oldId, newId, type);
    }

    updateModelReferences(model, newId, oldId, type);
  });
}

function getModelRefsByType(model: PureModel, type: IType) {
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
    .filter((key) => (fields[key].referenceDef as IReferenceDefinition).models.includes(type));
}

function updateModelReferences(
  model: PureModel,
  newId: IIdentifier,
  oldId: IIdentifier,
  type: IType,
) {
  const collection = getModelCollection(model);
  if (collection) {
    collection.getAllModels().map((item) => {
      getModelRefsByType(item, type)
        .map((ref) => getMeta(item, `ref_${ref}`))
        .filter(Boolean)
        .forEach((bucket: IBucket<PureModel>) => {
          if (isArray(bucket.value) || isObservableArray(bucket.value)) {
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
