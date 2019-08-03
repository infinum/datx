import { action, computed, IObservableArray, observable, reaction } from 'mobx';

import { getModelId, getModelType } from './helpers/model/utils';
import { IModelRef } from './interfaces/IModelRef';
import { PureCollection } from './PureCollection';
import { PureModel } from './PureModel';

export class Bucket<T extends PureModel> {
  protected readonly __rawList: IObservableArray<T | IModelRef> = observable.array([]);

  constructor(data: Array<IModelRef | T> = [], protected __collection: PureCollection) {
    this.__rawList.replace(data.map((item) => this.__getModel(item) || item));

    reaction(() => {
      const references = this.__rawList.filter((item) => this.__isReference(item));
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

  @computed
  public get length(): number {
    return this.list.length;
  }

  public get refList(): Array<IModelRef> {
    return this.__rawList.map(this.__getModelRef.bind(this));
  }

  public toJSON(): any {
    return this.refList.slice();
  }

  @computed public get snapshot() {
    return this.toJSON();
  }

  protected __getList(): Array<T> {
    return this.__rawList.map(this.__getModel.bind(this)).filter(Boolean) as any;
  }

  protected __getModelRef(model: T | IModelRef): IModelRef {
    if (model instanceof PureModel) {
      return {
        id: getModelId(model),
        type: getModelType(model),
      };
    }

    return model;
  }

  protected __getModel(model: T | IModelRef): T | null {
    if (model instanceof PureModel) {
      return model;
    }

    return this.__collection.findOne(model.type, model.id);
  }

  protected __isReference(model: T | IModelRef): boolean {
    return !(model instanceof PureModel);
  }

  @action
  private __reMap() {
    for (let i = 0; i < this.__rawList.length; i++) {
      if (this.__isReference(this.__rawList[i])) {
        const model = this.__getModel(this.__rawList[i]);
        if (model) {
          this.__rawList[i] = model;
        }
      }
    }
  }
}
