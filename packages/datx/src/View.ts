import { IDictionary, IRawModel, mapItems } from 'datx-utils';
import { action, computed, intercept, IObservableArray, observable } from 'mobx';

import { SORTED_NO_WRITE, UNIQUE_MODEL } from './errors';
import { error } from './helpers/format';
import { getModelId, getModelType } from './helpers/model/utils';
import { IIdentifier } from './interfaces/IIdentifier';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IRawView } from './interfaces/IRawView';
import { IType } from './interfaces/IType';
import { TChange } from './interfaces/TChange';
import { PureCollection } from './PureCollection';
import { PureModel } from './PureModel';

export class View<T extends PureModel = PureModel> {
  public readonly modelType: IType;
  @observable public sortMethod?: string|((item: T) => any);

  private readonly __models: IObservableArray<T> = observable.array([]);

  constructor(
    modelType: IModelConstructor<T>|IType,
    protected __collection: PureCollection,
    sortMethod?: string|((item: T) => any),
    models: Array<IIdentifier|T> = [],
    public unique: boolean = false,
  ) {
    this.modelType = getModelType(modelType);
    const items: Array<T> = mapItems(models, this.__getModel.bind(this))
      .filter(Boolean) as Array<T>;

    this.__models.replace(items);
    this.sortMethod = sortMethod;
  }

  @computed public get length() {
    return this.__models.length;
  }

  @computed public get list(): Array<T> {
    const list: Array<T> = this.__models.filter(Boolean);

    if (this.sortMethod) {
      const sortFn = typeof this.sortMethod === 'string'
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
      models: this.__models.map(getModelId).slice(),
      unique: this.unique,
    };
  }

  @computed public get snapshot() {
    return this.toJSON();
  }

  /**
   * Add an existing or a new model to the collection
   *
   * @template T
   * @param {T|IRawModel|IDictionary} data Model to be added
   * @returns {T} Added model
   * @memberof Collection
   */
  public add(data: T|IRawModel|IDictionary): T;

  /**
   * Add an array of existing or new models to the collection
   *
   * @template T
   * @param {Array<T|IRawModel|IDictionary>} data Array of models to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add(data: Array<T|IRawModel|IDictionary>): Array<T>;

  @action public add(
    data: T|IRawModel|IDictionary|Array<T|IRawModel|IDictionary>,
  ): T|Array<T> {
    const models = mapItems(data, (item) => this.__collection.add<T>(item, this.modelType)) as T | Array<T>;

    mapItems(models, (instance: T) => {
      if (!this.unique || this.__models.indexOf(instance) === -1) {
        this.__models.push(instance);
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
  public hasItem(model: T|IIdentifier): boolean {
    const id = getModelId(model);

    return Boolean(this.__models.find((item) => getModelId(item) === id));
  }

  /**
   * Remove a model from the view
   *
   * @param {IIdentifier|T} model Model identifier
   * @memberof Collection
   */
  @action public remove(model: IIdentifier|T) {
    const item = this.__getModel(model);
    if (item) {
      this.__models.remove(item);
    }
  }

  @action public removeAll() {
    this.__models.replace([]);
  }

  private __getModel(model: T | IIdentifier): T | null {
    if (model instanceof PureModel) {
      return model;
    }

    return this.__collection.findOne(this.modelType, getModelId(model));
  }

  private __partialListUpdate(change: TChange) {
    if (change.type === 'splice') {
      if (this.sortMethod && change.added.length > 0) {
        throw error(SORTED_NO_WRITE);
      }
      const added = change.added as Array<T>;

      const toRemove = this.__models.slice(change.index, change.removedCount);
      if (this.unique) {
        added.forEach((newItem) => {
          if (this.__models.indexOf(newItem) !== -1 && toRemove.indexOf(newItem) === -1) {
            throw error(UNIQUE_MODEL);
          }
        });
      }

      this.__models.splice(change.index, change.removedCount, ...added);

      return null;
    }

    if (this.sortMethod && change.newValue) {
      throw error(SORTED_NO_WRITE);
    }

    const newModel = this.__getModel(change.newValue as T);
    if (newModel) {
      const idIndex = this.__models.indexOf(newModel);
      if (this.unique && idIndex !== -1 && idIndex !== change.index) {
        throw error(UNIQUE_MODEL);
      }

      this.__models[change.index] = newModel;
    }

    return null;
  }
}
