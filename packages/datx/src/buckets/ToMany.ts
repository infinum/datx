import {
  action,
  computed,
  intercept,
  IObservableArray,
  IReactionDisposer,
  observable,
  reaction,
  runInAction,
  isArrayLike,
} from 'mobx';

import { error } from '../helpers/format';
import { getModelCollection, getModelRef, isReference } from '../helpers/model/utils';
import { IModelRef } from '../interfaces/IModelRef';
import { TChange } from '../interfaces/TChange';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { updateSingleAction } from '../helpers/patch';

export class ToMany<T extends PureModel> {
  protected readonly __rawList: IObservableArray<T | IModelRef> = observable.array([]);

  protected __collection?: PureCollection;

  private __disposer?: IReactionDisposer;

  constructor(
    data: Array<IModelRef | T> = [],
    collection?: PureCollection,
    protected __readonly: boolean = false,
    protected __model?: PureModel,
    protected __key?: string,
    protected __skipMissing = true,
  ) {
    if (data?.length > 0 && !collection) {
      throw error('The model needs to be in a collection to be referenceable');
    } else if (data && !isArrayLike(data)) {
      throw error('The reference must be an array of values.');
    }

    runInAction(() => {
      this.__rawList.replace(data || []);
      this.setCollection(collection);
    });
  }

  public setCollection(collection: PureCollection | undefined): void {
    this.__collection = collection;

    if (this.__disposer) {
      this.__disposer();
    }

    if (collection) {
      this.__rawList.forEach((item, index) => {
        const model = this.__getModel(item);

        if (model) {
          this.__rawList[index] = model;
        }
      });
      this.__disposer = reaction(() => {
        const references = this.__rawList.filter(isReference);
        const check = references
          .filter(Boolean)
          .filter((model: IModelRef) => collection.findOne(model.type, model.id));

        return check.length > 0;
      }, this.__reMap.bind(this));
    }
  }

  @computed
  public get value(): Array<T> {
    return this.__getList();
  }

  public set value(data: Array<T>) {
    if (this.__readonly) {
      throw error('This is a read-only bucket');
    } else if (!isArrayLike(data)) {
      throw error('The reference must be an array of values.');
    }

    this.__rawList.replace(data);
    if (this.__model && this.__key) {
      updateSingleAction(this.__model, this.__key, data);
    }
  }

  @computed
  public get length(): number {
    return this.value.length;
  }

  @computed
  public get refValue(): Array<IModelRef> {
    return this.__rawList.map(getModelRef);
  }

  public toJSON(): any {
    return this.refValue.slice();
  }

  @computed
  public get snapshot(): any {
    return this.toJSON();
  }

  protected __getList(): IObservableArray<T> {
    const list = this.__rawList
      .map(this.__getModel.bind(this))
      .filter((item) => (this.__skipMissing ? Boolean(item) : true))
      .filter((model) => Boolean(model && getModelCollection(model))) as any;
    const instances = observable.array(list, { deep: false });

    intercept(instances, this.__partialRawListUpdate.bind(this));

    return instances;
  }

  protected __getModel(model: T | IModelRef | null): T | null {
    if (model instanceof PureModel || model === null) {
      return model;
    }

    if (!this.__collection) {
      throw error('The model needs to be in a collection to be referenceable');
    }

    return this.__collection.findOne<T>(model.type, model.id);
  }

  @action
  private __partialRawListUpdate(change: TChange): null {
    if (this.__readonly) {
      throw error('This is a read-only bucket');
    }

    if (change.type === 'splice') {
      const added = change.added as Array<T>;

      this.__rawList.slice(change.index, change.removedCount);
      // eslint-disable-next-line prefer-spread
      this.__rawList.splice.apply(
        this.__rawList,
        ([change.index, change.removedCount] as Array<any>).concat(added),
      );

      return null;
    }

    const newModel = this.__getModel(change.newValue as T);

    if (newModel) {
      this.__rawList[change.index] = newModel;
    }

    return null;
  }

  @action
  private __reMap(): void {
    for (let i = 0; i < this.__rawList.length; i++) {
      if (isReference(this.__rawList[i])) {
        const model = this.__getModel(this.__rawList[i]);

        if (model) {
          this.__rawList[i] = model;
        }
      }
    }
  }
}
