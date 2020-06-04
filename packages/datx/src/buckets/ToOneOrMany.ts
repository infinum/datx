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
  private __isList = true;

  constructor(
    data: Array<T | IModelRef> | T | IModelRef | null,
    protected __collection?: PureCollection,
    protected __readonly: boolean = false,
    protected __model?: PureModel,
    protected __key?: string,
    protected __skipMissing = true,
  ) {
    this.__isList = isArrayLike(data);
    if (this.__isList) {
      this.__toManyBucket = new ToMany(
        data as Array<T | IModelRef>,
        __collection,
        __readonly,
        __model,
        __key,
        __skipMissing,
      );
    } else {
      this.__toOneBucket = new ToOne<T>(
        data as T,
        __collection,
        __readonly,
        __model,
        __key,
        __skipMissing,
      );
    }
  }

  public setCollection(value: PureCollection | undefined): void {
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
    } else if (this.__toOneBucket) {
      this.__toOneBucket.value = data as T;
    } else {
      this.__toOneBucket = new ToOne<T>(data as T, this.__collection);
    }
  }

  // An ugly workaround to still be able to update the response buckets
  // @ts-ignore
  private set __readonlyValue(data: T | Array<T> | null) {
    this.__isList = isArrayLike(data);
    if (this.__isList) {
      if (this.__toManyBucket) {
        // @ts-ignore
        const readonlyStatus = this.__toManyBucket.__readonly;

        // @ts-ignore
        this.__toManyBucket.__readonly = false;
        this.__toManyBucket.value = data as Array<T>;
        // @ts-ignore
        this.__toManyBucket.__readonly = readonlyStatus;
      } else {
        this.__toManyBucket = new ToMany(data as Array<T | IModelRef>, this.__collection);
      }
    } else if (this.__toOneBucket) {
      // @ts-ignore
      const readonlyStatus = this.__toOneBucket.__readonly;

      // @ts-ignore
      this.__toOneBucket.__readonly = false;
      this.__toOneBucket.value = data as T;
      // @ts-ignore
      this.__toOneBucket.__readonly = readonlyStatus;
    } else {
      this.__toOneBucket = new ToOne<T>(data as T, this.__collection);
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
  public get snapshot(): Array<IModelRef> | IModelRef | null {
    return this.toJSON();
  }
}
