import {computed} from 'mobx';

import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {assignModelKey, cloneModel, modelToJSON, updateModel} from '../helpers/model';
import {IActionsMixin} from '../interfaces/IActionsMixin';
import {IDictionary} from '../interfaces/IDictionary';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {Model} from '../Model';

export function withActions<T extends Model>(Base: IModelConstructor<T>) {
  const BaseClass = Base as typeof Model;

  if (!isModel(BaseClass)) {
    throw error(DECORATE_MODEL);
  }

  class WithActions extends BaseClass implements IActionsMixin<T> {
    public update(data: IDictionary<any>) {
      updateModel(this, data);
    }

    public clone(): IActionsMixin<T> & T {
      // @ts-ignore
      return cloneModel(this);
    }

    public assign(key: string, value: any) {
      assignModelKey(this, key, value);
    }

    public toJSON() {
      return modelToJSON(this);
    }
  }

  return WithActions as IModelConstructor<IActionsMixin<T> & T>;
}
