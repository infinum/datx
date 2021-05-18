import { IDictionary, IRawModel, mapItems } from 'datx-utils';
import { action, computed, intercept, IObservableArray, observable, reaction } from 'mobx';

import { SORTED_NO_WRITE, UNIQUE_MODEL } from './errors';
import { error } from './helpers/format';
import { isPropertySelectorFn } from './helpers/view';
import { getModelId, getModelType } from './helpers/model/utils';
import { IIdentifier } from './interfaces/IIdentifier';
import { IModelConstructor } from './interfaces/IModelConstructor';
import { IRawView } from './interfaces/IRawView';
import { IType } from './interfaces/IType';
import { TChange } from './interfaces/TChange';
import { PureCollection } from './PureCollection';
import { PureModel } from './PureModel';
import { SortMethod } from './types';

export class View<T extends PureModel = PureModel> {
  public readonly modelType: IType;
  @observable public sortMethod?: SortMethod<T>;

  private readonly __models: IObservableArray<T | IIdentifier> = observable.array([]);

  constructor(
    modelType: IModelConstructor<T>|IType,
    protected __collection: PureCollection,
    sortMethod?: SortMethod<T>,
    models: Array<IIdentifier|T> = [],
    public unique: boolean = false,
  ) {
    this.modelType = getModelType(modelType);
    const items: Array<T> = mapItems(models, (item) => {
      return this.__getModel(item) || item;
    }).filter(Boolean) as Array<T>;

    this.__models.replace(items);
    this.sortMethod = sortMethod;

    reaction(
      () => {
        const identifiers = this.__models.filter((item) => this.__isIdentifier(item));
        const check = identifiers.filter((model: IIdentifier) => this.__collection.findOne(this.modelType, model));

        return check.length > 0;
      },
      this.__reMap.bind(this),
    );
  }

  @computed public get length() {
    return this.list.length;
  }

  @computed public get list(): Array<T> {
    // this.__reMap();
    const list: Array<T> = this.__models
      .filter((item: T | IIdentifier) => !this.__isIdentifier(item))
      .filter(Boolean) as Array<T>;

    if (this.sortMethod) {
      const sortFn =
        typeof this.sortMethod === 'string' ? (item) => item[this.sortMethod as 'string'] : this.sortMethod;

      if (isPropertySelectorFn(sortFn)) {
        list.sort((a: T, b: T) => sortFn(a) - sortFn(b));
      } else {
        list.sort(sortFn);
      }
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

  private __isIdentifier(item: T | IIdentifier): boolean {
    return typeof item === 'string' || typeof item === 'number';
  }

  @action private __reMap() {
    for (let i = 0; i < this.__models.length; i++) {
      if (this.__isIdentifier(this.__models[i])) {
        const model = this.__getModel(this.__models[i]);
        if (model) {
          this.__models[i] = model;
        }
      }
    }
  }

  @action private __partialListUpdate(change: TChange) {
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
