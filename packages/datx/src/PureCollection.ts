import {IDictionary, IRawModel} from 'datx-utils';
import {action, computed, decorate, extendObservable, IObservableArray, IObservableObject, observable, set} from 'mobx';

import {MODEL_SINGLE_COLLECTION, UNDEFINED_MODEL, UNDEFINED_TYPE, VIEW_NAME_TAKEN} from './errors';
import {initModels, isSelectorFunction, upsertModel} from './helpers/collection';
import {error} from './helpers/format';
import {
  getModelCollection,
  getModelId,
  getModelType,
  modelToJSON,
  setModelMetaKey,
  updateModel,
} from './helpers/model/utils';
import {IIdentifier} from './interfaces/IIdentifier';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {IRawCollection} from './interfaces/IRawCollection';
import {IRawView} from './interfaces/IRawView';
import {IType} from './interfaces/IType';
import {TFilterFn} from './interfaces/TFilterFn';
import {PureModel} from './PureModel';
import {View} from './View';

export class PureCollection {
  /**
   * List of models available in the collection
   *
   * @static
   * @type {Array<typeof PureModel>}
   * @memberof Collection
   */
  public static types: Array<typeof PureModel | IModelConstructor> = [];

  public static views: IDictionary<{
    modelType: IType | PureModel;
    sortMethod?: string | ((PureModel) => any);
    unique?: boolean;
    mixins?: Array<(view: any) => any>;
  }> = {};

  public static defaultModel?: typeof PureModel;

  private __data: IObservableArray<PureModel> = observable.array([], {deep: false});

  private __views: Array<string> = [];

  @observable private __dataMap: IDictionary<IDictionary<PureModel>> = {};
  @observable private __dataList: IDictionary<IObservableArray<PureModel>> = {};

  constructor(data: Array<IRawModel> | IRawCollection = []) {
    extendObservable(this, {});
    if (data instanceof Array) {
      this.insert(data);
    } else if (data && 'models' in data) {
      this.insert(data.models);
    }

    const staticCollection = this.constructor as typeof PureCollection;
    const initViews = (data && 'views' in data) ? data.views : {};
    Object.keys(staticCollection.views).forEach((key) => {
      const view = staticCollection.views[key];
      const init = initViews[key] || view;
      this.addView(key, init.modelType, {
        mixins: view.mixins,
        models: init.models || [],
        sortMethod: view.sortMethod,
        unique: init.unique,
      });
    });
  }

  /**
   * Function for inserting raw models into the collection. Used when hydrating the collection
   *
   * @param {Array<IRawModel>} data Raw model data
   * @returns {Array<PureModel>} A list of initialized models
   * @memberof Collection
   */
  @action public insert(data: Array<Partial<IRawModel>>): Array<PureModel> {
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
   * Add an array of new models to the collection
   *
   * @template T
   * @param {Array<IRawModel|IDictionary<any>>} data Array of new data to be added
   * @param {(IType|IModelConstructor<T>)} model Model type to be added
   * @returns {Array<T>} Added models
   * @memberof Collection
   */
  public add<T extends PureModel>(data: Array<IRawModel|IDictionary<any>>, model: IType|IModelConstructor<T>): Array<T>;

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

  @action public add(
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
  public find<T extends PureModel>(type: IType|T|IModelConstructor<T>, id?: IIdentifier|PureModel): T|null;

  /**
   * Find a model based on a matching function
   *
   * @param {TFilterFn} test Function used to match the model
   * @returns {(PureModel|null)} The first matching model
   * @memberof Collection
   */
  public find<T extends PureModel>(test: TFilterFn): T|null;

  public find(model: IType|typeof PureModel|(TFilterFn), id?: IIdentifier|PureModel) {
    if (id instanceof PureModel) {
      return id;
    }

    return isSelectorFunction(model)
      ? (this.__data.find(model as TFilterFn) || null)
      : (this.__findByType(model as typeof PureModel, id) || null);
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
  public findAll<T extends PureModel>(model?: IType|IModelConstructor<T>): Array<T> {
    if (model) {
      const type = getModelType(model);
      if (!(type in this.__dataList)) {
        set(this.__dataList, {[type]: observable.array([])});
      }

      return this.__dataList[type];
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
    const id = getModelId(model);

    return Boolean(this.find(model, id));
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

  @action public remove(obj: IType|typeof PureModel|PureModel, id?: IIdentifier) {
    const model = typeof obj === 'object' ? obj : this.find(obj, id);
    if (model) {
      this.__removeModel(model);
    }
  }

  /**
   * Remove all models of the given model type from the collection
   *
   * @param {(IType|typeof PureModel)} type Model type
   * @memberof Collection
   */
  @action public removeAll(type: IType|typeof PureModel) {
    this.__removeModel(this.findAll(type).slice());
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
   * @returns {IRawCollection} Pure JS value of the collection
   * @memberof Collection
   */
  public toJSON(): IRawCollection {
    const views: IDictionary<IRawView> = {};

    this.__views.forEach((key) => {
      views[key] = this[key].toJSON();
    });

    return {
      models: this.__data.map(modelToJSON),
      views,
    };
  }

  public get snapshot() {
    return this.toJSON();
  }

  /**
   * Reset the collection (remove all models)
   *
   * @memberof Collection
   */
  @action public reset() {
    this.__data.forEach((model) => {
      setModelMetaKey(model, 'collection', undefined);
    });
    this.__data.replace([]);
    this.__dataList = observable({}) as IObservableObject & IDictionary<IObservableArray<PureModel>>;
    this.__dataMap = observable({}) as IObservableObject &IDictionary<IDictionary<PureModel>>;
  }

  public getAllModels() {
    return this.__data.slice();
  }

  /**
   * Add a view to the collection
   *
   * @template T Model type of the view
   * @param {string} name View name
   * @param {(IModelConstructor<T>|IType)} type Model type the view will represent
   * @param {({
   *       sortMethod?: string|((item: T) => any),
   *       models?: Array<IIdentifier|PureModel>,
   *       unique?: boolean,
   *       mixins?: Array<(view: any) => any>,
   *     })} [{sortMethod, models, unique, mixins}={}] View options
   * @returns {View} The created view
   * @memberof PureCollection
   */
  public addView<T extends PureModel = PureModel>(
    name: string,
    type: IModelConstructor<T>|IType,
    {sortMethod, models = [], unique, mixins}: {
      sortMethod?: string|((item: T) => any);
      models?: Array<IIdentifier|T>;
      unique?: boolean;
      mixins?: Array<(view: any) => any>;
    } = {},
  ) {
    if (name in this) {
      throw error(VIEW_NAME_TAKEN);
    }

    const ViewConstructor = mixins
      ? mixins.reduce((view: any, mixin: (view: any) => any) => {
          return mixin(view);
        }, View) as typeof View
      : View;

    this.__views.push(name);
    this[name] = new ViewConstructor<T>(type, this, sortMethod, models, unique);

    return this[name];
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

    if (!model && model !== 0) {
      throw error(UNDEFINED_TYPE);
    }

    const type = getModelType(model as IType|typeof PureModel);
    const modelInstance = upsertModel(data, type, this);
    this.__insertModel(modelInstance, type);

    return modelInstance;
  }

  private __insertModel(model: PureModel|Array<PureModel>, type?: IType, id?: IIdentifier) {
    if (model instanceof Array) {
      model.forEach((item) => {
        this.__insertModel(item, type, id);
      });

      return;
    }

    const collection = getModelCollection(model);
    if (collection && collection !== this) {
      throw error(MODEL_SINGLE_COLLECTION);
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    const stringType = modelType.toString();

    const existingModel = this.find(modelType, modelId);
    if (existingModel) {
      updateModel(existingModel, model);

      return;
    }

    this.__data.push(model);
    if (modelType in this.__dataList) {
      this.__dataList[modelType].push(model);
    } else {
      set(this.__dataList, stringType, observable.array([model], {deep: false}));
    }

    if (modelType in this.__dataMap) {
      set(this.__dataMap[modelType], modelId.toString(), model);
    } else {
      set(this.__dataMap, stringType, observable.shallowObject({[modelId]: model}));
    }
    setModelMetaKey(model, 'collection', this);
  }

  private __removeModel(model: PureModel|Array<PureModel>, type?: IType, id?: IIdentifier) {
    if (model instanceof Array) {
      model.forEach((item) => {
        this.__removeModel(item, type, id);
      });

      return;
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    this.__data.remove(model);
    this.__dataList[modelType].remove(model);
    set(this.__dataMap[modelType], modelId.toString(), undefined);
    setModelMetaKey(model, 'collection', undefined);
  }

  private __findByType(model: IType|typeof PureModel|PureModel, id?: IIdentifier) {
    const type = getModelType(model);
    const stringType = type.toString();

    if (id) {
      if (!(type in this.__dataMap)) {
        set(this.__dataMap, stringType, {[id]: undefined});
      } else if (!(id in this.__dataMap[type])) {
        set(this.__dataMap[type], id.toString(), undefined);
      }

      return this.__dataMap[type][id];
    } else {
      if (!(type in this.__dataList)) {
        set(this.__dataList, stringType, observable.array([], {deep: false}));
      }

      return this.__dataList[type].length ? this.__dataList[type][0] : null;
    }
  }

  private __changeModelId(oldId: IIdentifier, newId: IIdentifier, type: IType) {
    this.__dataMap[type][newId] = this.__dataMap[type][oldId];
    delete this.__dataMap[type][oldId];
  }
}
