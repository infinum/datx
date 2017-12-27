import {computed, extendObservable} from 'mobx';

import {Model} from '../Model';
import {storage} from '../services/storage';

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
