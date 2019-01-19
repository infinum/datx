import { computed } from 'mobx';

import { DECORATE_MODEL } from '../errors';
import { error } from '../helpers/format';
import { isModel } from '../helpers/mixin';
import { getRefId } from '../helpers/model/fields';
import {
  getModelCollection,
  getModelId,
  getModelMetaKey,
  getModelType,
  getOriginalModel,
  modelToJSON,
} from '../helpers/model/utils';
import { IMetaMixin } from '../interfaces/IMetaMixin';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { PureModel } from '../PureModel';

/**
 * Extends the model with the exposed meta data
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
export function withMeta<T extends PureModel = PureModel>(Base: IModelConstructor<T>) {
  const BaseClass = Base as typeof PureModel;

  if (!isModel(BaseClass)) {
    throw error(DECORATE_MODEL);
  }

  class MetaClass {
    private __instance: T;
    constructor(instance: T) {
      this.__instance = instance;
    }

    @computed public get collection() {
      return getModelCollection(this.__instance);
    }

    @computed public get id() {
      return getModelId(this.__instance);
    }

    @computed public get original(): T | undefined {
      return getModelMetaKey(this.__instance, 'originalId') ? getOriginalModel<T>(this.__instance) : undefined;
    }

    @computed public get refs() {
      const refDefs = getModelMetaKey(this.__instance, 'refs') || {};

      const refs = {};
      Object.keys(refDefs).forEach((key) => {
        refs[key] = getRefId(this.__instance, key);
      });

      return refs;
    }

    @computed public get snapshot() {
      return modelToJSON(this.__instance);
    }

    @computed public get type() {
      return getModelType(this.__instance);
    }
  }

  // tslint:disable-next-line:max-classes-per-file
  class WithMeta extends BaseClass implements IMetaMixin {
    // @ts-ignore
    public readonly meta = new MetaClass(this);
  }

  return WithMeta as IModelConstructor<IMetaMixin<T> & T>;
}
