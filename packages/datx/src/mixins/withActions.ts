import { action } from 'mobx';

import { error } from '../helpers/format';
import { isModel } from '../helpers/mixin';
import { initModelRef } from '../helpers/model/init';
import {
  assignModel,
  cloneModel,
  modelToJSON,
  updateModel,
  getModelType,
} from '../helpers/model/utils';
import { IActionsMixin } from '../interfaces/IActionsMixin';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IReferenceOptions } from '../interfaces/IReferenceOptions';
import { TRefValue } from '../interfaces/TRefValue';
import { PureModel } from '../PureModel';

/**
 * Extends the model with some handy actions
 *
 * @export
 * @template T
 * @param {IModelConstructor<T>} Base Model to extend
 * @returns Extended model
 */
export function withActions<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<IActionsMixin<T> & T> {
  const BaseClass = Base as typeof PureModel;

  if (!isModel(Base)) {
    throw error('This mixin can only decorate models');
  }

  class WithActions extends BaseClass implements IActionsMixin<T> {
    @action
    public update(data: Record<string, any>): void {
      updateModel(this, data);
    }

    public clone(): IActionsMixin<T> & T {
      // @ts-ignore
      return cloneModel(this);
    }

    @action
    public assign(key: string, value: any): void {
      assignModel(this, key, value);
    }

    public addReference<V extends PureModel, U extends typeof PureModel>(
      key: string,
      value: TRefValue<V>,
      options: IReferenceOptions<U>,
    ): void {
      initModelRef(
        this,
        key,
        {
          type: options.type,
          model: getModelType(options.model),
        },
        value,
      );
    }

    public toJSON(): any {
      return modelToJSON(this);
    }
  }

  return WithActions as IModelConstructor<IActionsMixin<T> & T>;
}
