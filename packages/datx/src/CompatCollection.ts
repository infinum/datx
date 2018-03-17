import {assignComputed, IRawModel} from 'datx-utils';
import {computed, decorate, extendObservable} from 'mobx';

import {Collection} from './Collection';
import {CompatModel} from './CompatModel';
import {getModelType} from './helpers/model/utils';

export class CompatCollection extends Collection {
  public static types = [CompatModel];

  constructor(data?) {
    super(data);

    const getters = {};

    this.static.types.forEach((model) => {
      const type = getModelType(model);
      assignComputed(this, type.toString(), () => this.findAll(type));
    });
  }

  public get static(): typeof CompatCollection {
    return this.constructor as typeof CompatCollection;
  }

  public toJS() {
    return this.toJSON();
  }
}
