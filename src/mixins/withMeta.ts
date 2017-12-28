import {computed} from 'mobx';

import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {
  getModelCollections,
  getModelId,
  getModelType,
  getOriginalModel,
} from '../helpers/model';
import {IMetaMixin} from '../interfaces/IMetaMixin';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {IRawModel} from '../interfaces/IRawModel';
import {Model} from '../Model';
import {storage} from '../services/storage';

export function withMeta<T extends Model>(Base: IModelConstructor<T>) {
  // @ts-ignore
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

  // @ts-ignore
  return WithMeta as IModelConstructor<IMetaMixin<T> & T>;
}
