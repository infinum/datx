import { computed } from 'mobx';

import { READ_ONLY, REF_NEEDS_COLLECTION, REF_SINGLE } from '../errors';
import { error } from '../helpers/format';
import { getModelRef } from '../helpers/model/utils';
import { IModelRef } from '../interfaces/IModelRef';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';

export class ToOne<T extends PureModel> {
  private __rawValue: T | IModelRef | null = null;

  constructor(
    data: T | IModelRef | null,
    protected __collection?: PureCollection,
    protected __readonly: boolean = false,
  ) {
    if (data && !this.__collection) {
      throw error(REF_NEEDS_COLLECTION);
    } else if (data instanceof Array) {
      throw error(REF_SINGLE, { key: '' });
    }

    this.__rawValue = data;
  }

  public setCollection(value: PureCollection | undefined) {
    this.__collection = value;
  }

  @computed
  public get value(): T | null {
    return this.__getModel(this.__rawValue);
  }

  public set value(data: T | null) {
    if (this.__readonly) {
      throw error(READ_ONLY);
    } else if (data instanceof Array) {
      throw error(REF_SINGLE, { key: '' });
    }
    this.__rawValue = data;
  }

  @computed
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

    if (!this.__collection) {
      throw error(REF_NEEDS_COLLECTION);
    }

    return this.__collection.findOne(model.type, model.id);
  }
}
