import {IDictionary, IRawModel} from 'datx-utils';
import {action, computed, intercept, IObservableArray, observable} from 'mobx';

import {SORTED_NO_WRITE, UNIQUE_MODEL} from './errors';
import {error} from './helpers/format';
import {getModelId, getModelType} from './helpers/model/utils';
import {IIdentifier} from './interfaces/IIdentifier';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {IType} from './interfaces/IType';
import {TChange} from './interfaces/TChange';
import {PureCollection} from './PureCollection';
import {PureModel} from './PureModel';

export class View<T extends PureModel> {
  public readonly modelType: IType;
  private __models: IObservableArray<IIdentifier> = observable.array([]);

  constructor(
    modelType: IModelConstructor<T>|IType,
    private __collection: PureCollection,
    public sortMethod?: string|((item: T) => any),
    models: Array<IIdentifier|PureModel> = [],
    public unique: boolean = false,
  ) {
    this.__models.replace(models.map(getModelId));
    this.modelType = getModelType(modelType);
  }

  @computed public get length() {
    return this.__models.length;
  }

  @computed public get list(): Array<T> {
    const list = this.__models.map((id) => this.__collection.find(this.modelType, id));

    if (this.sortMethod) {
      const sortFn = typeof this.sortMethod === 'string'
        ? (item) => item[this.sortMethod as 'string']
        : this.sortMethod;
      list.sort((a, b) => sortFn(a) - sortFn(b));
    }

    const instances = observable.array(list, {deep: false});

    intercept(instances, (change: TChange) => this.__partialListUpdate(change));
    return instances;
  }

  public toJSON(): {modelType: IType, models: Array<IIdentifier>, unique: boolean} {
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
   * @param {T|IRawModel|IDictionary<any>} data Model to be added
   * @returns {T} Added model
   * @memberof Collection
   */
  public add(data: T|IRawModel|IDictionary<any>): T;

  /**
   * Add an array of existing or new models to the collection
   *
   * @template T
   * @param {Array<T|IRawModel|IDictionary<any>>} data Array of models to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add(data: Array<T|IRawModel|IDictionary<any>>): Array<T>;

  @action public add(
    data: PureModel|IRawModel|IDictionary<any>|Array<PureModel>|Array<IRawModel|IDictionary<any>>,
  ): PureModel|Array<PureModel> {
    const models = this.__collection.add([].concat(data), this.modelType);

    models.forEach((instance) => {
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
   * @param {PureModel} model Model to check
   * @returns {boolean} The given model is in the collection
   * @memberof Collection
   */
  public hasItem(model: PureModel): boolean {
    const id = getModelId(model);
    return this.__models.indexOf(id) !== -1;
  }

  /**
   * Remove a model from the view
   *
   * @param {IIdentifier|PureModel} model Model identifier
   * @memberof Collection
   */
  @action public remove(model: IIdentifier|PureModel) {
    const id = getModelId(model);
    this.__models.remove(id);
  }

  @action public removeAll() {
    this.__models.replace([]);
  }

  private __partialListUpdate(change: TChange) {
    // TODO: if this.unique, throw if already exists
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
}
