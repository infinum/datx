import { action, computed, intercept, IObservableArray, observable, reaction } from 'mobx';

import { READ_ONLY } from '../errors';
import { error } from '../helpers/format';
import { getModelRef, isReference } from '../helpers/model/utils';
import { IModelRef } from '../interfaces/IModelRef';
import { TChange } from '../interfaces/TChange';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';

export class ToMany<T extends PureModel> {
  protected readonly __rawList: IObservableArray<T | IModelRef> = observable.array([]);

  constructor(
    data: Array<IModelRef | T> = [],
    protected __collection: PureCollection,
    protected __readonly: boolean = false,
  ) {
    this.__rawList.replace(data.map((item) => this.__getModel(item) || item));

    reaction(() => {
      const references = this.__rawList.filter(isReference);
      const check = references.filter((model: IModelRef) =>
        this.__collection.findOne(model.type, model.id),
      );

      return check.length > 0;
    }, this.__reMap.bind(this));
  }

  @computed
  public get list(): Array<T> {
    return this.__getList();
  }

  public set list(val: Array<T>) {
    if (this.__readonly) {
      throw error(READ_ONLY);
    }
    this.__rawList.replace(val);
  }

  @computed
  public get length(): number {
    return this.list.length;
  }

  public get refList(): Array<IModelRef> {
    return this.__rawList.map(getModelRef);
  }

  public toJSON(): any {
    return this.refList.slice();
  }

  @computed
  public get snapshot() {
    return this.toJSON();
  }

  protected __getList(): IObservableArray<T> {
    const list = this.__rawList.map(this.__getModel.bind(this)).filter(Boolean) as any;

    const instances = observable.array(list, { deep: false });

    intercept(instances, this.__partialRawListUpdate.bind(this));

    return instances;
  }

  protected __getModel(model: T | IModelRef): T | null {
    if (model instanceof PureModel) {
      return model;
    }

    return this.__collection.findOne(model.type, model.id);
  }

  @action
  private __partialRawListUpdate(change: TChange) {
    if (this.__readonly) {
      throw error(READ_ONLY);
    }

    if (change.type === 'splice') {
      const added = change.added as Array<T>;
      this.__rawList.slice(change.index, change.removedCount);
      this.__rawList.splice(change.index, change.removedCount, ...added);

      return null;
    }

    const newModel = this.__getModel(change.newValue as T);
    if (newModel) {
      this.__rawList[change.index] = newModel;
    }

    return null;
  }

  @action
  private __reMap() {
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
