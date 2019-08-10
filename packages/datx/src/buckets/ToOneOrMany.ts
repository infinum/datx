import { computed } from 'mobx';

import { IModelRef } from '../interfaces/IModelRef';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { ToMany } from './ToMany';
import { ToOne } from './ToOne';

export class ToOneOrMany<T extends PureModel> {
  private __listBucket!: ToMany<T>;
  private __singleBucket!: ToOne<T>;
  private __isList: boolean = true;

  constructor(
    data: Array<T | IModelRef> | T | IModelRef | null,
    protected __collection: PureCollection,
  ) {
    this.__isList = data instanceof Array;
    if (data instanceof Array) {
      this.__listBucket = new ToMany(data, __collection);
    } else {
      this.__singleBucket = new ToOne(data, __collection);
    }
  }

  @computed
  public get value(): T | Array<T> | null {
    return this.__isList ? this.__listBucket.list : this.__singleBucket.value;
  }

  public set value(val: T | Array<T> | null) {
    this.__isList = val instanceof Array;
    if (val instanceof Array) {
      if (this.__listBucket) {
        this.__listBucket.list = val;
      } else {
        this.__listBucket = new ToMany(val, this.__collection);
      }
    } else {
      if (this.__singleBucket) {
        this.__singleBucket.value = val;
      } else {
        this.__singleBucket = new ToOne(val, this.__collection);
      }
    }
  }

  public get refValue(): Array<IModelRef> | IModelRef | null {
    return this.__isList ? this.__listBucket.refList : this.__singleBucket.refValue;
  }

  public toJSON(): Array<IModelRef> | IModelRef | null {
    return this.refValue;
  }

  @computed
  public get snapshot() {
    return this.toJSON();
  }
}
