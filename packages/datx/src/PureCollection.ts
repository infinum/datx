import {computed, IObservableArray, observable} from 'mobx';

import {MODEL_SINGLE_COLLECTION, UNDEFINED_MODEL, UNDEFINED_TYPE} from './errors';
import {initModels, isSelectorFunction, upsertModel} from './helpers/collection';
import {error} from './helpers/format';
import {getModelCollection, getModelId, getModelType, modelToJSON, updateModel} from './helpers/model/utils';
import {IDictionary} from './interfaces/IDictionary';
import {IIdentifier} from './interfaces/IIdentifier';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';
import {TFilterFn} from './interfaces/TFilterFn';
import {PureModel} from './PureModel';
import {storage} from './services/storage';

export class PureCollection {

  /**
   * List of models available in the collection
   *
   * @static
   * @type {Array<typeof PureModel>}
   * @memberof Collection
   */
  public static types: Array<typeof PureModel|IModelConstructor<PureModel>> = [];

  private __data: IObservableArray<PureModel> = observable.shallowArray([]);

  @observable private __dataMap: IDictionary<IDictionary<PureModel>> = {};
  @observable private __dataList: IDictionary<IObservableArray<PureModel>> = {};

  constructor(data: Array<IRawModel> = []) {
    this.insert(data);
  }

  /**
   * Function for inserting raw models into the collection. Used when hydrating the collection
   *
   * @param {Array<IRawModel>} data Raw model data
   * @returns {Array<PureModel>} A list of initialized models
   * @memberof Collection
   */
  public insert(data: Array<IRawModel>): Array<PureModel> {
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
  public add<T extends PureModel>(data: T): T;

  /**
   * Add an array of existing models to the collection
   *
   * @template T
   * @param {Array<T>} data Array of models to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add<T extends PureModel>(data: Array<T>): Array<T>;

  /**
   * Add a new model to the collection
   *
   * @template T
   * @param {(IRawModel|IDictionary<any>)} data New data to be added
   * @param {(IType|IModelConstructor<T>)} model Model type to be added
   * @returns {T} Added model
   * @memberof Collection
   */
  public add<T extends PureModel>(data: IRawModel|IDictionary<any>, model: IType|IModelConstructor<T>): T;

  /**
   * Add an array of new models to the collection
   *
   * @template T
   * @param {Array<IRawModel|IDictionary<any>>} data Array of new data to be added
   * @param {(IType|IModelConstructor<T>)} model Model type to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add<T extends PureModel>(data: Array<IRawModel|IDictionary<any>>, model: IType|IModelConstructor<T>): Array<T>;

  public add(
    data: PureModel|IRawModel|IDictionary<any>|Array<PureModel>|Array<IRawModel|IDictionary<any>>,
    model?: IType|IModelConstructor,
  ): PureModel|Array<PureModel> {
    return (data instanceof Array) ? this.__addArray(data, model) : this.__addSingle(data, model);
  }

  /**
   * Find a model based on the defined type and (optional) identifier
   *
   * @param {(IType|typeof PureModel|PureModel)} type Model type
   * @param {IIdentifier} [id] Model identifier
   * @returns {(PureModel|null)} The first matching model
   * @memberof Collection
   */
  public find(type: IType|typeof PureModel|PureModel, id?: IIdentifier|PureModel): PureModel|null;

  /**
   * Find a model based on a matching function
   *
   * @param {TFilterFn} test Function used to match the model
   * @returns {(PureModel|null)} The first matching model
   * @memberof Collection
   */
  public find(test: TFilterFn): PureModel|null;

  public find(model: IType|typeof PureModel|(TFilterFn), id?: IIdentifier|PureModel): PureModel|null {
    if (id instanceof PureModel) {
      return id;
    }

    return isSelectorFunction(model)
      ? this.__data.find(model as TFilterFn)
      : this.__findByType(model as typeof PureModel, id);
  }

  /**
   * Filter models based on a matching function
   *
   * @param {TFilterFn} test Function used to match the models
   * @returns {(PureModel|null)} The matching models
   * @memberof Collection
   */
  public filter(test: TFilterFn): Array<PureModel> {
    return this.__data.filter(test);
  }

  /**
   * Find all matching models or all models if no type is given
   *
   * @param {(IType|typeof PureModel)} [model] Model type to select
   * @returns {Array<PureModel>} List of matching models
   * @memberof Collection
   */
  public findAll(model?: IType|typeof PureModel): Array<PureModel> {
    if (model) {
      const type = getModelType(model);
      return this.__dataList[type] || [];
    }
    return this.__data;
  }

  /**
   * Check if a model is in the collection
   *
   * @param {PureModel} model Model to check
   * @returns {boolean} The given model is in the collection
   * @memberof Collection
   */
  public hasItem(model: PureModel): boolean {
    const type = getModelType(model);
    const id = getModelId(model);
    return type in this.__dataMap && id in this.__dataMap[type];
  }

  /**
   * Remove the first model based on the type and (optional) identifier
   *
   * @param {(IType|typeof PureModel)} type Model type
   * @param {IIdentifier} [id] Model identifier
   * @memberof Collection
   */
  public remove(type: IType|typeof PureModel, id?: IIdentifier);

  /**
   * Remove the given model from the collection
   *
   * @param {PureModel} model Model to be removed from the collection
   * @memberof Collection
   */
  public remove(model: PureModel);

  public remove(obj: IType|typeof PureModel|PureModel, id?: IIdentifier) {
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
   * Reset the collection (remove all models)
   *
   * @memberof Collection
   */
  public reset() {
    this.__data.map((model) => storage.setModelMetaKey(model, 'collection', undefined));
    this.__data.replace([]);
    const types = Object.keys(this.__dataList);
    types.forEach((type) => {
      delete this.__dataList[type];
      delete this.__dataMap[type];
    });
  }

  public getAllModels() {
    return this.__data.slice();
  }

  private __addArray<T extends PureModel>(data: Array<T>): Array<T>;
  private __addArray<T extends PureModel>(data: Array<IDictionary<any>>, model?: IType|IModelConstructor<T>): Array<T>;
  private __addArray(data: Array<PureModel|IDictionary<any>>, model?: IType|IModelConstructor): Array<PureModel> {
    return data.filter(Boolean).map((item) => this.__addSingle(item, model));
  }

  private __addSingle<T extends PureModel>(data: T): T;
  private __addSingle<T extends PureModel>(data: IDictionary<any>, model?: IType|IModelConstructor<T>): T;
  private __addSingle(data: PureModel|IDictionary<any>|IIdentifier, model?: IType|IModelConstructor) {
    if (!data || typeof data === 'number' || typeof data === 'string') {
      return data;
    }

    if (data instanceof PureModel) {
      if (!this.hasItem(data)) {
        this.__insertModel(data);
      }

      return data;
    }

    if (!model) {
      throw error(UNDEFINED_TYPE);
    }

    const type = getModelType(model as IType|typeof PureModel);
    const modelInstance = upsertModel(data, type, this);
    this.__insertModel(modelInstance, type);

    const id = getModelId(modelInstance);

    return modelInstance;
  }

  private __insertModel(model: PureModel|Array<PureModel>, type?: IType, id?: IIdentifier) {
    if (model instanceof Array) {
      return model.forEach((item) => this.__insertModel(item, type, id));
    }

    const collection = getModelCollection(model);
    if (collection && collection !== this) {
      throw error(MODEL_SINGLE_COLLECTION);
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    this.__data.push(model);
    this.__dataList[modelType] = this.__dataList[modelType] || observable.shallowArray([]);
    this.__dataList[modelType].push(model);
    this.__dataMap[modelType] = this.__dataMap[modelType] || observable.shallowObject({});
    this.__dataMap[modelType][modelId] = model;
    storage.setModelMetaKey(model, 'collection', this);
  }

  private __removeModel(model: PureModel|Array<PureModel>, type?: IType, id?: IIdentifier) {
    if (model instanceof Array) {
      return model.forEach((item) => this.__removeModel(item, type, id));
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    this.__data.remove(model);
    this.__dataList[modelType].remove(model);
    delete this.__dataMap[modelType][modelId];
    storage.setModelMetaKey(model, 'collection', undefined);
  }

  private __findByType(model: IType|typeof PureModel|PureModel, id?: IIdentifier) {
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
