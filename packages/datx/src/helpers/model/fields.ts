import { getMeta, setMeta, isArray, warn } from 'datx-utils';

import { PureModel } from '../../PureModel';
import { IBucket } from '../../interfaces/IBucket';
import { TRefValue } from '../../interfaces/TRefValue';
import {
  runInAction,
  isObservableArray,
  IObservableArray,
  intercept,
  observable,
  IArraySplice,
  IArrayChange,
} from 'mobx';
import { IIdentifier } from '../../interfaces/IIdentifier';
import { getModelCollection, getModelId, getModelType } from './utils';
import { IFieldDefinition, IReferenceDefinition } from '../../Attribute';
import { MetaModelField } from '../../enums/MetaModelField';
import { MetaClassField } from '../../enums/MetaClassField';
import { IType } from '../../interfaces/IType';
import { TChange } from '../../interfaces/TChange';
import { error } from '../format';

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
  return bucket ? (bucket.value = value) : null;
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

function modelAddReference(model: PureModel, key: string, newReference: PureModel) {
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  const refOptions = fields[key]?.referenceDef;
  if (!refOptions) {
    return;
  }
  if (isArray(model[key])) {
    if (!model[key].includes(newReference)) {
      model[key].push(newReference);
    }
  } else {
    model[key] = newReference;
  }
}

function modelRemoveReference(model: PureModel, key: string, oldReference: PureModel) {
  if (isArray(model[key])) {
    (model[key] as IObservableArray<PureModel>).remove(oldReference);
  } else if (model[key] === oldReference) {
    model[key] = null;
  }
}

function hasBackRef(item: PureModel, property: string, target: PureModel): boolean {
  if (item[property] === null || item[property] === undefined) {
    return false;
  } else if (item[property] instanceof PureModel) {
    return item[property] === target;
  } else {
    return item[property].includes(target);
  }
}

function backRefSplice(
  model: PureModel,
  key: string,
  change: IArraySplice<PureModel>,
  refOptions: IReferenceDefinition,
) {
  const property = refOptions.property as string;
  change.added.forEach((item) => modelAddReference(item, property, model));
  const removed = model[key].slice(change.index, change.index + change.removedCount);
  removed.forEach((item: PureModel) => modelRemoveReference(item, property, model));

  return null;
}

function backRefChange(
  model: PureModel,
  key: string,
  change: IArrayChange<PureModel>,
  refOptions: IReferenceDefinition,
) {
  const property = refOptions.property as string;
  const oldValue = model[key].length > change.index ? model[key][change.index] : null;
  if (change.newValue) {
    modelAddReference(change.newValue, property, model);
  }
  if (oldValue) {
    modelRemoveReference(oldValue, property, model);
  }

  warn(
    `This shouldn't have happened. Please open an issue: https://github.com/infinum/datx/issues/new`,
  );

  return null;
}

function partialBackRefUpdate(model: PureModel, key: string, change: TChange) {
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  const refOptions = fields[key]?.referenceDef;

  if (!refOptions) {
    return null;
  }

  if (change.type === 'splice') {
    return backRefSplice(model, key, change, refOptions);
  }

  return backRefChange(model, key, change, refOptions);
}

export function getBackRef(model: PureModel, key: string): PureModel | Array<PureModel> | null {
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});
  const refOptions = fields[key]?.referenceDef;

  if (!refOptions) {
    return null;
  }

  const types = refOptions.models.map(getModelType);

  const collection = getModelCollection(model);
  if (!collection) {
    return null;
  }

  const backModels = ([] as Array<PureModel>)
    .concat(...types.map((type) => collection.findAll(type)))
    .filter((item) => hasBackRef(item, refOptions.property as string, model));

  const backData: IObservableArray<PureModel> = observable.array(backModels, { deep: false });
  intercept(backData, (change: TChange) => partialBackRefUpdate(model, key, change));

  return backData;
}

export function updateBackRef(_model: PureModel, _key: string, _value: TRefValue) {
  throw error('Back references are read only');
}
