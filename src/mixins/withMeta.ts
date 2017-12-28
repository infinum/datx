import {computed} from 'mobx';

import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {getModelCollections, getModelId, getModelType} from '../helpers/model';
import {IMetaMixin} from '../interfaces/IMetaMixin';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {IRawModel} from '../interfaces/IRawModel';
import {Model} from '../Model';

export function withMeta<T extends Model, U extends typeof Model>(Base: IModelConstructor<T>) {
  // @ts-ignore
  const BaseClass = Base as typeof Model;

  if (!isModel(BaseClass)) {
    throw error(DECORATE_MODEL);
  }

  class WithMeta extends BaseClass {
    @computed public get meta() {
      return {
        collections: getModelCollections(this),
        id: getModelId(this),
        type: getModelType(this),
      };
    }
  }

  return WithMeta as IModelConstructor<IMetaMixin & T> & U;
}
