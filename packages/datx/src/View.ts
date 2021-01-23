import { IArraySplice, IRawModel, mapItems, mobx, removeFromArray, replaceInArray } from '@datx/utils';

import { ToMany } from './buckets/ToMany';
import { error } from './helpers/format';
import { getModelId, getModelType, isReference } from './helpers/model/utils';
import { IIdentifier } from './interfaces/IIdentifier';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IModelRef } from './interfaces/IModelRef';
import { IRawView } from './interfaces/IRawView';
import { IType } from './interfaces/IType';
import { TChange } from './interfaces/TChange';
import { PureCollection } from './PureCollection';
import { PureModel } from './PureModel';

export class View<T extends PureModel = PureModel> extends ToMany<T> {
  public readonly modelType: IType;

  @mobx.observable
  public sortMethod?: string | ((item: T) => any);

  constructor(
    modelType: IModelConstructor<T> | IType,
    protected __collection: PureCollection,
    sortMethod?: string | ((item: T) => any),
    models: Array<IIdentifier | T> = [],
    public unique: boolean = false,
  ) {
    super(
      models.map((model) =>
        model instanceof PureModel ? model : { id: model, type: getModelType(modelType) },
      ),
      __collection,
    );
    this.modelType = getModelType(modelType);
    this.sortMethod = sortMethod;
    mobx.makeObservable(this, {
      sortMethod: mobx.observable,
      length: mobx.computed,
      list: mobx.computed,
    });
  }

  @mobx.computed
  public get length(): number {
    return this.value.length;
  }

  @mobx.computed
  public get list(): Array<T> {
    const list: Array<T> = this.value.slice();

    if (this.sortMethod) {
      const sortFn =
        typeof this.sortMethod === 'string'
          ? (item): any => item[this.sortMethod as 'string']
          : this.sortMethod;

      list.sort((a: T, b: T) => (sortFn(a) === sortFn(b) ? 0 : sortFn(a) > sortFn(b) ? 1 : -1));
    }

    const instances = mobx.observable.array(list, { deep: false });

    mobx.intercept(instances, this.__partialListUpdate.bind(this));

    return instances;
  }

  public set list(list: Array<T>) {
    this.__partialListUpdate({
      type: 'splice',
      index: 0,
      removed: this.list,
      removedCount: this.__rawList.length,
      added: list,
      addedCount: list.length,
    } as unknown as IArraySplice<PureModel>);
  }

  public toJSON(): IRawView {
    return {
      modelType: this.modelType,
      models: this.__rawList.map(getModelId).slice(),
      unique: this.unique,
    };
  }

  public add(data: T | IRawModel | Record<string, any>): T;

  public add(data: Array<T | IRawModel | Record<string, any>>): Array<T>;

  public add(
    data: T | IRawModel | Record<string, any> | Array<T | IRawModel | Record<string, any>>,
  ): T | Array<T> {
    const models = mapItems(data, (item) => this.__collection.add<T>(item, this.modelType)) as
      | T
      | Array<T>;

    mobx.runInAction(() => {
      mapItems(models, (instance: T) => {
        if (!this.unique || this.__indexOf(instance) === -1) {
          this.__rawList.push(instance);
        }
      });
    });

    return models;
  }

  public hasItem(model: T | IIdentifier): boolean {
    const id = getModelId(model);

    return Boolean(this.__getList().find((item) => getModelId(item) === id));
  }

  public remove(model: IIdentifier | T): void {
    mobx.runInAction(() => {
      const item = this.__getModel(this.__normalizeModel(model));

      if (item) {
        removeFromArray(this.__rawList, item);
      }
    });
  }

  public removeAll(): void {
    mobx.runInAction(() => {
      replaceInArray(this.__rawList, []);
    });
  }

  private __partialListUpdate(change: TChange): null {
    if (change.type === 'splice') {
      if (this.sortMethod && change.added.length > 0) {
        throw error("New models can't be added directly to a sorted view list");
      }
      const added = (change.added as Array<T>).map(this.__normalizeModel.bind(this));

      const toRemove = this.__rawList.slice(change.index, change.removedCount);

      if (this.unique) {
        added.forEach((newItem, index) => {
          if (
            this.__indexOf(newItem) !== -1 &&
            (this.__indexOf(newItem, toRemove) === -1 || this.__indexOf(newItem, added) !== index)
          ) {
            throw error('The models in this view need to be unique');
          }
        });
      }

      mobx.runInAction(() => {
        // eslint-disable-next-line prefer-spread
        this.__rawList.splice.apply(
          this.__rawList,
          ([change.index, change.removedCount] as Array<any>).concat(added),
        );
      });

      return null;
    }

    mobx.runInAction(() => {
      if (this.sortMethod && change.newValue) {
        throw error("New models can't be added directly to a sorted view list");
      }

      const newModel = this.__getModel(this.__normalizeModel(change.newValue as any));

      if (newModel) {
        const idIndex = this.__indexOf(newModel);

        if (this.unique && idIndex !== -1 && idIndex !== change.index) {
          throw error('The models in this view need to be unique');
        }

        this.__rawList[change.index] = newModel;
      }
    });

    return null;
  }

  private __normalizeModel(model: T | IIdentifier): T | IModelRef {
    return model instanceof PureModel ? model : { id: model, type: this.modelType };
  }

  private __indexOf(model: T | IModelRef, target: Array<IModelRef | T> = this.__rawList): number {
    return target.findIndex((item) => {
      if (item instanceof PureModel && model instanceof PureModel) {
        return item === model;
      }

      if (isReference(item) && !(model instanceof PureModel)) {
        return (item as IModelRef).id === model.id && (item as IModelRef).type === model.type;
      }

      return false;
    });
  }
}
