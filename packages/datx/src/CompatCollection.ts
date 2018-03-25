import {assignComputed, deprecated, IRawModel, warn} from 'datx-utils';
import {computed, decorate, extendObservable} from 'mobx';

import {Collection} from './Collection';
import {CompatModel} from './CompatModel';
import {getModelType} from './helpers/model/utils';

warn('CompatCollection is just a migration tool. Please move to Collection as soon as possible.');

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
    deprecated('collection.static is deprecated.');
    return this.constructor as typeof CompatCollection;
  }

  public toJS() {
    deprecated('collection.toJS() is deprecated. Use collection.toJSON() instead');
    return this.toJSON();
  }
}
