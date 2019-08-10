import { computed } from 'mobx';

import { READ_ONLY } from '../errors';
import { error } from '../helpers/format';
import { getModelRef } from '../helpers/model/utils';
import { IModelRef } from '../interfaces/IModelRef';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';

export class ToOne<T extends PureModel> {
  private __rawValue: T | IModelRef | null = null;

  constructor(
    data: T | IModelRef | null,
    protected __collection: PureCollection,
    protected __readonly: boolean = false,
  ) {
    this.__rawValue = data;
  }

  @computed
  public get value(): T | null {
    return this.__getModel(this.__rawValue);
  }

  public set value(val: T | null) {
    if (this.__readonly) {
      throw error(READ_ONLY);
    }
    this.__rawValue = val;
  }

  public get refValue(): IModelRef | null {
    return this.__rawValue ? getModelRef(this.__rawValue) : null;
  }

  public toJSON(): IModelRef | null {
    return this.refValue;
  }

  @computed
  public get snapshot() {
    return this.toJSON();
  }

  protected __getModel(model: T | IModelRef | null): T | null {
    if (model instanceof PureModel || model === null) {
      return model;
    }

    return this.__collection.findOne(model.type, model.id);
  }
}
