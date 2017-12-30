import {Collection} from '../Collection';
import {IDictionary} from '../interfaces/IDictionary';
import {Model} from '../Model';
import {getModelId, getModelType} from './model/utils';

export function byType(models: Array<Model>): IDictionary<Array<Model>> {
  const list = {};

  models.forEach((model) => {
    const type = getModelType(model);
    const id = getModelId(model);
    list[type] = list[type] || [];
    list[type].push(model);
  });

  return list;
}

export function byId(collections: Array<Collection>): IDictionary<IDictionary<Model>> {
  const modelHash = {};

  collections.forEach((collection) => {
    collection.findAll().forEach((model) => {
      const id = getModelId(model);
      const type = getModelType(model);

      modelHash[type] = modelHash[type] || [];
      modelHash[type][id] = modelHash[type][id] || model;
    });
  });

  return modelHash;
}

export function reducePrototypeChain<T, U>(obj: U, reduceFn: (state: T, item: U) => T, initialValue: T) {
  let value = initialValue;
  let model = obj;
  while (model) {
    value = reduceFn(value, model);
    model = Object.getPrototypeOf(model);
  }
  return value;
}
