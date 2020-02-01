import { computed, observable, isArrayLike } from 'mobx';

import { IModelRef } from '../interfaces/IModelRef';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { ToMany } from './ToMany';
import { ToOne } from './ToOne';

export class ToOneOrMany<T extends PureModel> {
  private __toManyBucket!: ToMany<T>;
  private __toOneBucket!: ToOne<T>;

  @observable
  private __isList: boolean = true;

  constructor(
    data: Array<T | IModelRef> | T | IModelRef | null,
    protected __collection?: PureCollection,
    protected __readonly: boolean = false,
    protected __model?: PureModel,
    protected __key?: string,
  ) {
    this.__isList = isArrayLike(data);
    if (this.__isList) {
      this.__toManyBucket = new ToMany(
        data as Array<T | IModelRef>,
        __collection,
        __readonly,
        __model,
        __key,
      );
    } else {
      this.__toOneBucket = new ToOne<T>(data as T, __collection, __readonly, __model, __key);
    }
  }

  public setCollection(value: PureCollection | undefined) {
    this.__collection = value;
    if (this.__toManyBucket) {
      this.__toManyBucket.setCollection(value);
    }
    if (this.__toOneBucket) {
      this.__toOneBucket.setCollection(value);
    }
  }

  @computed
  public get value(): T | Array<T> | null {
    return this.__isList ? this.__toManyBucket.value : this.__toOneBucket.value;
  }

  public set value(data: T | Array<T> | null) {
    this.__isList = isArrayLike(data);
    if (this.__isList) {
      if (this.__toManyBucket) {
        this.__toManyBucket.value = data as Array<T>;
      } else {
        this.__toManyBucket = new ToMany(data as Array<T | IModelRef>, this.__collection);
      }
    } else {
      if (this.__toOneBucket) {
        this.__toOneBucket.value = data as T;
      } else {
        this.__toOneBucket = new ToOne<T>(data as T, this.__collection);
      }
    }
  }

  @computed
  public get refValue(): Array<IModelRef> | IModelRef | null {
    return this.__isList ? this.__toManyBucket.refValue : this.__toOneBucket.refValue;
  }

  public toJSON(): Array<IModelRef> | IModelRef | null {
    return this.refValue;
  }

  @computed
  public get snapshot() {
    return this.toJSON();
  }
}
