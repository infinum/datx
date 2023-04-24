import { getMeta, setMeta, mobx } from '@datx/utils';
import { PatchType } from '../enums/PatchType';
import { IPatch } from '../interfaces/IPatch';
import { PureModel } from '../PureModel';
import { getModelCollection, getModelId, getModelRef, getModelType } from './model/utils';
import { MetaModelField } from '../enums/MetaModelField';
import { IFieldDefinition } from '../Field';

function isEmptyObject(data: object): boolean {
  return Object.keys(data).length === 0;
}

export function reverseAction(type: PatchType): PatchType {
  switch (type) {
    case PatchType.CRATE:
      return PatchType.REMOVE;
    case PatchType.REMOVE:
      return PatchType.CRATE;
    default:
      return PatchType.UPDATE;
  }
}

interface IPatchMeta<T extends PureModel = PureModel> {
  patchType: PatchType;
  oldValue?: Partial<T>;
  newValue?: Partial<T>;
}

export function triggerAction(patchMeta: IPatchMeta, model: PureModel): void {
  const patch: IPatch = Object.assign({}, patchMeta, {
    model: {
      id: getModelId(model),
      type: getModelType(model),
    },
  });

  const listeners = getMeta<Array<(patch: IPatch) => void>>(
    model,
    MetaModelField.PatchListeners,
    [],
  ).slice();

  const collection = getModelCollection(model);

  if (collection && '__patchListeners' in collection) {
    ((collection['__patchListeners'] || []) as Array<(patch: IPatch) => void>).forEach((item) => {
      listeners.push(item);
    });
  }

  listeners.forEach((listener) => {
    listener(patch);
  });
}

export function startAction(model: PureModel): void {
  const patchData = getMeta(model, MetaModelField.Patch, {
    count: 0,
    newValue: {},
    oldValue: {},
  });

  patchData.count++;
  setMeta(model, MetaModelField.Patch, patchData);
}

export function updateAction(
  model: PureModel,
  key: string,
  value: any,
  oldValue?: { value: any },
): void {
  const patchData = getMeta(model, MetaModelField.Patch, {
    count: 0,
    newValue: {},
    oldValue: {},
  });

  if ((model[key] === value && !oldValue) || (oldValue && value === oldValue.value)) {
    return;
  }
  const fields = getMeta<Record<string, IFieldDefinition>>(model, MetaModelField.Fields, {});

  if (!(key in patchData.oldValue)) {
    if (oldValue) {
      patchData.oldValue[key] = oldValue.value;
    } else if (key in fields && fields[key].referenceDef) {
      patchData.oldValue[key] = getModelRef(model[key]);
    } else {
      patchData.oldValue[key] = model[key];
    }
  }
  patchData.newValue[key] = key in fields && fields[key].referenceDef ? getModelRef(value) : value;
  setMeta(model, MetaModelField.Patch, patchData);
}

export function endAction(model: PureModel, patchType: PatchType = PatchType.UPDATE): void {
  const patchData = getMeta(model, MetaModelField.Patch, {
    count: 0,
    newValue: {},
    oldValue: {},
  });

  patchData.count--;
  if (patchData.count === 0) {
    const newValue = mobx.toJS(patchData.newValue);
    const oldValue = mobx.toJS(patchData.oldValue);

    if (!isEmptyObject(newValue) || !isEmptyObject(oldValue)) {
      triggerAction({ newValue, oldValue, patchType }, model);
    }
    setMeta(model, MetaModelField.Patch, { count: 0, oldValue: {}, newValue: {} });
  } else {
    setMeta(model, MetaModelField.Patch, patchData);
  }
}

export function updateSingleAction(
  model: PureModel,
  key: string,
  value: any,
  oldValue?: { value: any },
): void {
  startAction(model);
  updateAction(model, key, value, oldValue);
  endAction(model);
}
