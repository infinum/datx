import {computed, extendObservable} from 'mobx';

import {IIdentifier} from '../interfaces/IIdentifier';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';
import {storage} from '../services/storage';
import { Collection } from '../index';

export function setInitial<T extends Model>(obj: T, key: string, defaultValue: any) {

  // Initialize the observable field to the default value
  storage.setModelDataKey(obj, key, defaultValue);

  // Set up the computed prop
  extendObservable(obj, {
    [key]: computed(
      () => storage.getModelDataKey(obj, key),
      (value) => storage.setModelDataKey(obj, key, value),
    ),
  });
}

export function getModelType(model: IType|typeof Model|Model): IType {
  if (typeof model === 'function') {
    return model.type;
  } else if (typeof model === 'object') {
    return storage.getModelDataKey(model, 'type') || (model.constructor as typeof Model).type;
  }
  return model;
}

// TODO: Get the real model id
export function getModelId(model: Model): IIdentifier {
  return storage.getModelMetaKey(model, 'id');
}

export function getModelCollections(model: Model): Array<Collection> {
  return storage.getModelCollections(model);
}
