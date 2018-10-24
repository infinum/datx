import {toJS} from 'mobx';

import {PatchType} from '../enums/PatchType';
import {IPatch} from '../interfaces/IPatch';
import {PureModel} from '../PureModel';
import {storage} from '../services/storage';
import {getModelCollection, getModelId, getModelType} from './model/utils';

function isEmptyObject(data: object) {
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

export function triggerAction(patchMeta: IPatchMeta, model: PureModel) {
  const patch: IPatch = {
    ...patchMeta,
    model: {
      id: getModelId(model),
      type: getModelType(model),
    },
  };

  const listeners: Array<(patch: IPatch) => void> = [];

  if ('__patchListeners' in model) {
    listeners.push(...model['__patchListeners'] || []);
  }

  const collection = getModelCollection(model);
  if (collection && '__patchListeners' in collection) {
    listeners.push(...collection['__patchListeners'] || []);
  }

  listeners.forEach((listener) => {
    listener(patch);
  });
}

export function startAction(model: PureModel) {
  const patchData = storage.getModelMetaKey(model, 'patch') || {count: 0, oldValue: {}, newValue: {}};
  patchData.count++;
  storage.setModelMetaKey(model, 'patch', patchData);
}

export function updateAction(model: PureModel, key: string, value: any) {
  const patchData = storage.getModelMetaKey(model, 'patch') || {count: 0, oldValue: {}, newValue: {}};
  if (model[key] === value) {
    return;
  }
  if (!(key in patchData.oldValue)) {
    patchData.oldValue[key] = model[key];
  }
  patchData.newValue[key] = value;
  storage.setModelMetaKey(model, 'patch', patchData);
}

export function endAction(model: PureModel, patchType: PatchType = PatchType.UPDATE) {
  const patchData = storage.getModelMetaKey(model, 'patch') || {count: 0, oldValue: {}, newValue: {}};
  patchData.count--;
  if (patchData.count === 0) {
    const newValue = toJS(patchData.newValue);
    const oldValue = toJS(patchData.oldValue);
    if (!isEmptyObject(newValue) || !isEmptyObject(oldValue)) {
      triggerAction({newValue, oldValue, patchType}, model);
    }
    storage.setModelMetaKey(model, 'patch', {count: 0, oldValue: {}, newValue: {}});
  } else {
    storage.setModelMetaKey(model, 'patch', patchData);
  }
}
