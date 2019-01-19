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

  private readonly __models: IObservableArray<IIdentifier> = observable.array([]);

  constructor(
    modelType: IModelConstructor<T>|IType,
    protected __collection: PureCollection,
    sortMethod?: string|((item: T) => any),
    models: Array<IIdentifier|T> = [],
    public unique: boolean = false,
  ) {
    this.__models.replace(models.map(getModelId));
    this.sortMethod = sortMethod;
    this.modelType = getModelType(modelType);

    // @ts-ignore
    this.__collection.__viewList.push(this);
  }

  @computed public get length() {
    return this.__models.length;
  }

  @computed public get list(): Array<T> {
    const list: Array<T> = this.__models
      .map((id) => this.__collection.find(this.modelType, id))
      .filter(Boolean) as any;

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
      models: this.__models.slice(),
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

    mapItems(models, (instance) => {
      const id = getModelId(instance);
      if (!this.unique || this.__models.indexOf(id) === -1) {
        this.__models.push(id);
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

    return this.__models.indexOf(id) !== -1;
  }

  /**
   * Remove a model from the view
   *
   * @param {IIdentifier|T} model Model identifier
   * @memberof Collection
   */
  @action public remove(model: IIdentifier|T) {
    const id = getModelId(model);
    this.__models.remove(id);
  }

  @action public removeAll() {
    this.__models.replace([]);
  }

  private __partialListUpdate(change: TChange) {
    if (change.type === 'splice') {
      if (this.sortMethod && change.added.length > 0) {
        throw error(SORTED_NO_WRITE);
      }
      const added = change.added.map(getModelId);

      const toRemove = this.__models.slice(change.index, change.removedCount);
      if (this.unique) {
        added.forEach((newItemId) => {
          if (this.__models.indexOf(newItemId) !== -1 && toRemove.indexOf(newItemId) === -1) {
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

    const newId = getModelId(change.newValue);
    const idIndex = this.__models.indexOf(newId);
    if (this.unique && idIndex !== -1 && idIndex !== change.index) {
      throw error(UNIQUE_MODEL);
    }

    this.__models[change.index] = newId;

    return null;
  }

  // tslint:disable-next-line no-unused-variables
  private __changeModelId(oldId: IIdentifier, newId: IIdentifier) {
    const oldIdIndex = this.__models.indexOf(oldId);
    if (oldIdIndex !== -1) {
      this.__models[oldIdIndex] = newId;
    }
  }
}
