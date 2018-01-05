import {computed} from 'mobx';

import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {getModelCollections, getModelId, getModelType, getOriginalModel} from '../helpers/model/utils';
import {IMetaMixin} from '../interfaces/IMetaMixin';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {Model} from '../Model';
import {storage} from '../services/storage';

/**
 * Extends the model with the exposed meta data
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
export function withMeta<T extends Model>(Base: IModelConstructor<T>) {
  const BaseClass = Base as typeof Model;

  if (!isModel(BaseClass)) {
    throw error(DECORATE_MODEL);
  }

  class WithMeta extends BaseClass implements IMetaMixin {
    @computed public get meta() {
      return Object.freeze({
        collections: getModelCollections(this),
        id: getModelId(this),
        original: storage.getModelMetaKey(this, 'originalId') && getOriginalModel(this) || undefined,
        type: getModelType(this),
      });
    }
  }

  return WithMeta as IModelConstructor<IMetaMixin<T> & T>;
}
