import {computed} from 'mobx';

import {DECORATE_MODEL} from '../errors';
import {error} from '../helpers/format';
import {isModel} from '../helpers/mixin';
import {initModelRef} from '../helpers/model/init';
import {assignModel, cloneModel, modelToJSON, updateModel} from '../helpers/model/utils';
import {IActionsMixin} from '../interfaces/IActionsMixin';
import {IDictionary} from '../interfaces/IDictionary';
import {IModelConstructor} from '../interfaces/IModelConstructor';
import {IReferenceOptions} from '../interfaces/IReferenceOptions';
import {TRefValue} from '../interfaces/TRefValue';
import {Model} from '../Model';

/**
 * Extends the model with some handy actions
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
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
      assignModel(this, key, value);
    }

    public addReference(key: string, value: TRefValue, options: IReferenceOptions) {
      initModelRef(this, key, options, value);
    }

    public toJSON() {
      return modelToJSON(this);
    }
  }

  return WithActions as IModelConstructor<IActionsMixin<T> & T>;
}
