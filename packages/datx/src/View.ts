import { IDictionary, IRawModel, mapItems } from 'datx-utils';
import { action, computed, intercept, observable } from 'mobx';

import { ToMany } from './buckets/ToMany';
import { SORTED_NO_WRITE, UNIQUE_MODEL } from './errors';
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
  @observable public sortMethod?: string | ((item: T) => any);

  constructor(
    modelType: IModelConstructor<T> | IType,
    protected __collection: PureCollection,
    sortMethod?: string | ((item: T) => any),
    models: Array<IIdentifier | T> = [],
    public unique: boolean = false,
  ) {
    super(
      models.map((model) => {
        return model instanceof PureModel ? model : { id: model, type: getModelType(modelType) };
      }),
      __collection,
    );
    this.modelType = getModelType(modelType);
    this.sortMethod = sortMethod;
  }

  @computed public get length() {
    return this.list.length;
  }

  @computed public get list(): Array<T> {
    const list: Array<T> = super.__getList().slice();

    if (this.sortMethod) {
      const sortFn =
        typeof this.sortMethod === 'string'
          ? (item) => item[this.sortMethod as 'string']
          : this.sortMethod;
      list.sort((a: T, b: T) => sortFn(a) - sortFn(b));
    }

    const instances = observable.array(list, { deep: false });

    intercept(instances, this.__partialListUpdate.bind(this));

    return instances;
  }

  public toJSON(): IRawView {
    return {
      modelType: this.modelType,
      models: this.__rawList.map(getModelId).slice(),
      unique: this.unique,
    };
  }

  /**
   * Add an existing or a new model to the collection
   *
   * @template T
   * @param {T|IRawModel|IDictionary} data Model to be added
   * @returns {T} Added model
   * @memberof Collection
   */
  public add(data: T | IRawModel | IDictionary): T;

  /**
   * Add an array of existing or new models to the collection
   *
   * @template T
   * @param {Array<T|IRawModel|IDictionary>} data Array of models to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add(data: Array<T | IRawModel | IDictionary>): Array<T>;

  @action public add(
    data: T | IRawModel | IDictionary | Array<T | IRawModel | IDictionary>,
  ): T | Array<T> {
    const models = mapItems(data, (item) => this.__collection.add<T>(item, this.modelType)) as
      | T
      | Array<T>;

    mapItems(models, (instance: T) => {
      if (!this.unique || this.__indexOf(instance) === -1) {
        this.__rawList.push(instance);
      }
    });

    return models;
  }

  /**
   * Check if a model is in the collection
   *
   * @param {T|IIdentifier} model Model to check
   * @returns {boolean} The given model is in the collection
   * @memberof Collection
   */
  public hasItem(model: T | IIdentifier): boolean {
    const id = getModelId(model);

    return Boolean(this.__rawList.find((item) => getModelId(item) === id));
  }

  /**
   * Remove a model from the view
   *
   * @param {IIdentifier|T} model Model identifier
   * @memberof Collection
   */
  @action public remove(model: IIdentifier | T) {
    const item = this.__getModel(this.__normalizeModel(model));
    if (item) {
      this.__rawList.remove(item);
    }
  }

  @action public removeAll() {
    this.__rawList.replace([]);
  }

  @action private __partialListUpdate(change: TChange) {
    if (change.type === 'splice') {
      if (this.sortMethod && change.added.length > 0) {
        throw error(SORTED_NO_WRITE);
      }
      const added = (change.added as Array<T>).map(this.__normalizeModel.bind(this));

      const toRemove = this.__rawList.slice(change.index, change.removedCount);
      if (this.unique) {
        added.forEach((newItem) => {
          if (this.__indexOf(newItem) !== -1 && this.__indexOf(newItem, toRemove) === -1) {
            throw error(UNIQUE_MODEL);
          }
        });
      }

      this.__rawList.splice(change.index, change.removedCount, ...added);

      return null;
    }

    if (this.sortMethod && change.newValue) {
      throw error(SORTED_NO_WRITE);
    }

    const newModel = this.__getModel(this.__normalizeModel(change.newValue as any));
    if (newModel) {
      const idIndex = this.__indexOf(newModel);
      if (this.unique && idIndex !== -1 && idIndex !== change.index) {
        throw error(UNIQUE_MODEL);
      }

      this.__rawList[change.index] = newModel;
    }

    return null;
  }

  private __normalizeModel(model: T | IIdentifier): T | IModelRef {
    return model instanceof PureModel ? model : { id: model, type: this.modelType };
  }

  private __indexOf(model: T | IModelRef, target: Array<IModelRef | T> = this.__rawList): number {
    return target.findIndex((item) => {
      if (item instanceof PureModel && model instanceof PureModel) {
        return item === model;
      } else if (isReference(item) && !(model instanceof PureModel)) {
        return (item as IModelRef).id === model.id && (item as IModelRef).type === model.type;
      }

      return false;
    });
  }
}
