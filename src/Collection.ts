import {computed, IObservableArray, observable} from 'mobx';

import {COLLECTION_DESTROYED, UNDEFINED_MODEL, UNDEFINED_TYPE} from './errors';
import {initModels, isSelectorFunction, upsertModel} from './helpers/collection';
import {error} from './helpers/format';
import {getModelId, getModelType, modelToJSON, updateModel} from './helpers/model/utils';
import {IDictionary} from './interfaces/IDictionary';
import {IIdentifier} from './interfaces/IIdentifier';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';
import {TFilterFn} from './interfaces/TFilterFn';
import {Model} from './Model';
import {storage} from './services/storage';

export class Collection {

  /**
   * List of models available in the collection
   *
   * @static
   * @type {Array<typeof Model>}
   * @memberof Collection
   */
  public static types: Array<typeof Model> = [];

  private __data: IObservableArray<Model> = observable.shallowArray([]);
  private __initialized: boolean = true;

  @observable private __dataMap: IDictionary<IDictionary<Model>> = {};
  @observable private __dataList: IDictionary<IObservableArray<Model>> = {};

  constructor(data: Array<IRawModel> = []) {
    this.insert(data);
    storage.registerCollection(this);
  }

  /**
   * Function for inserting raw models into the collection. Used when hydrating the collection
   *
   * @param {Array<IRawModel>} [data=[]] Raw model data
   * @returns {Array<Model>} A list of initialized models
   * @memberof Collection
   */
  public insert(data: Array<IRawModel> = []): Array<Model> {
    this.__confirmValid();
    const models = initModels(this, data);
    this.__insertModel(models);
    return models;
  }

  /**
   * Add an existing model to the collection
   *
   * @template T
   * @param {T} data Model to be added
   * @returns {T} Added model
   * @memberof Collection
   */
  public add<T extends Model>(data: T): T;

  /**
   * Add an array of existing models to the collection
   *
   * @template T
   * @param {Array<T>} data Array of models to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add<T extends Model>(data: Array<T>): Array<T>;

  /**
   * Add a new model to the collection
   *
   * @template T
   * @param {(IRawModel|IDictionary<any>)} data New data to be added
   * @param {(IType|IModelConstructor<T>)} model Model type to be added
   * @returns {T} Added model
   * @memberof Collection
   */
  public add<T extends Model>(data: IRawModel|IDictionary<any>, model: IType|IModelConstructor<T>): T;

  /**
   * Add an array of new models to the collection
   *
   * @template T
   * @param {Array<IRawModel|IDictionary<any>>} data Array of new data to be added
   * @param {(IType|IModelConstructor<T>)} model Model type to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add<T extends Model>(data: Array<IRawModel|IDictionary<any>>, model: IType|IModelConstructor<T>): Array<T>;

  public add(
    data: Model|IRawModel|IDictionary<any>|Array<Model>|Array<IRawModel|IDictionary<any>>,
    model?: IType|IModelConstructor,
  ): Model|Array<Model> {
    this.__confirmValid();
    return (data instanceof Array) ? this.__addArray(data, model) : this.__addSingle(data, model);
  }

  /**
   * Find a model based on the defined type and (optional) identifier
   *
   * @param {(IType|typeof Model|Model)} type Model type
   * @param {IIdentifier} [id] Model identifier
   * @returns {(Model|null)} The first matching model
   * @memberof Collection
   */
  public find(type: IType|typeof Model|Model, id?: IIdentifier): Model|null;

  /**
   * Find a model based on a matching function
   *
   * @param {TFilterFn} test Function used to match the model
   * @returns {(Model|null)} The first matching model
   * @memberof Collection
   */
  public find(test: TFilterFn): Model|null;

  public find(model: IType|typeof Model|(TFilterFn), id?: IIdentifier): Model|null {
    return isSelectorFunction(model)
      ? this.__data.find(model as TFilterFn)
      : this.__findByType(model as typeof Model, id);
  }

  /**
   * Filter models based on a matching function
   *
   * @param {TFilterFn} test Function used to match the models
   * @returns {(Model|null)} The matching models
   * @memberof Collection
   */
  public filter(test: TFilterFn): Array<Model> {
    return this.__data.filter(test);
  }

  /**
   * Find all matching models or all models if no type is given
   *
   * @param {(IType|typeof Model)} [model] Model type to select
   * @returns {Array<Model>} List of matching models
   * @memberof Collection
   */
  public findAll(model?: IType|typeof Model): Array<Model> {
    if (model) {
      const type = getModelType(model);
      return this.__dataList[type] || [];
    }
    return this.__data;
  }

  /**
   * Check if a model is in the collection
   *
   * @param {Model} model Model to check
   * @returns {boolean} The given model is in the collection
   * @memberof Collection
   */
  public hasItem(model: Model): boolean {
    const type = getModelType(model);
    const id = getModelId(model);
    return type in this.__dataMap && id in this.__dataMap[type];
  }

  /**
   * Remove the first model based on the type and (optional) identifier
   *
   * @param {(IType|typeof Model)} type Model type
   * @param {IIdentifier} [id] Model identifier
   * @memberof Collection
   */
  public remove(type: IType|typeof Model, id?: IIdentifier);

  /**
   * Remove the given model from the collection
   *
   * @param {Model} model Model to be removed from the collection
   * @memberof Collection
   */
  public remove(model: Model);

  public remove(obj: IType|typeof Model|Model, id?: IIdentifier) {
    this.__confirmValid();
    const model = typeof obj === 'object' ? obj : this.find(obj, id);
    if (model) {
      this.__removeModel(model);
    }
  }

  /**
   * A total count of models in the collection
   *
   * @readonly
   * @type {number}
   * @memberof Collection
   */
  @computed public get length(): number {
    return this.__data.length;
  }

  /**
   * Get the serializable value of the collection
   *
   * @returns {Array<IRawModel>} Pure JS value of the collection
   * @memberof Collection
   */
  public toJSON(): Array<IRawModel> {
    return this.__data.map(modelToJSON);
  }

  /**
   * Destroy the collection and clean up all references
   *
   * @memberof Collection
   */
  public destroy() {
    this.__confirmValid();
    storage.unregisterCollection(this);
    this.__initialized = false;
  }

  /**
   * Reset the collection (remove all models)
   *
   * @memberof Collection
   */
  public reset() {
    this.__confirmValid();
    this.__data.replace([]);
    const types = Object.keys(this.__dataList);
    types.forEach((type) => {
      delete this.__dataList[type];
      delete this.__dataMap[type];
    });
  }

  private __confirmValid() {
    if (!this.__initialized) {
      throw error(COLLECTION_DESTROYED);
    }
  }

  private __addArray<T extends Model>(data: Array<T>): Array<T>;
  private __addArray<T extends Model>(data: Array<IDictionary<any>>, model?: IType|IModelConstructor<T>): Array<T>;
  private __addArray(data: Array<Model|IDictionary<any>>, model?: IType|IModelConstructor): Array<Model> {
    return data.map((item) => this.__addSingle(item, model));
  }

  private __addSingle<T extends Model>(data: T): T;
  private __addSingle<T extends Model>(data: IDictionary<any>, model?: IType|IModelConstructor<T>): T;
  private __addSingle(data: Model|IDictionary<any>, model?: IType|IModelConstructor) {
    if (data instanceof Model) {
      if (this.hasItem(data)) {
        return;
      }

      this.__insertModel(data);
      return data;
    }

    if (!model) {
      throw error(UNDEFINED_TYPE);
    }

    const type = getModelType(model as IType|typeof Model);
    const modelInstance = upsertModel(data, type, this.constructor as typeof Collection);
    this.__insertModel(modelInstance, type);

    const id = getModelId(modelInstance);

    return modelInstance;
  }

  private __insertModel(model: Model|Array<Model>, type?: IType, id?: IIdentifier) {
    if (model instanceof Array) {
      return model.forEach((item) => this.__insertModel(item, type, id));
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    this.__data.push(model);
    this.__dataList[modelType] = this.__dataList[modelType] || observable.shallowArray([]);
    this.__dataList[modelType].push(model);
    this.__dataMap[modelType] = this.__dataMap[modelType] || observable.shallowObject({});
    this.__dataMap[modelType][modelId] = model;
  }

  private __removeModel(model: Model|Array<Model>, type?: IType, id?: IIdentifier) {
    if (model instanceof Array) {
      return model.forEach((item) => this.__removeModel(item, type, id));
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    this.__data.remove(model);
    this.__dataList[modelType].remove(model);
    delete this.__dataMap[modelType][modelId];
  }

  private __findByType(model: IType|typeof Model|Model, id?: IIdentifier) {
    const type = getModelType(model);

    if (id) {
      const models = this.__dataMap[type] || {};
      // console.log('Find by type', type, id, Object.keys(models))
      return models[id] || null;
    } else {
      const data = this.__dataList[type] || [];
      return data[0] || null;
    }
  }

  private __changeModelId(oldId: IIdentifier, newId: IIdentifier, type: IType) {
    this.__dataMap[type][newId] = this.__dataMap[type][oldId];
    delete this.__dataMap[type][oldId];
  }
}
