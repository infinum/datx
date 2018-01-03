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
  public static types: Array<typeof Model> = [];

  private __data: IObservableArray<Model> = observable.shallowArray([]);
  private __initialized: boolean = true;

  @observable private __dataMap: IDictionary<IDictionary<Model>> = {};
  @observable private __dataList: IDictionary<IObservableArray<Model>> = {};

  constructor(data: Array<IRawModel> = []) {
    this.insert(data);
    storage.registerCollection(this);
  }

  public insert(data: Array<IRawModel> = []): Array<Model> {
    this.__confirmValid();
    const models = initModels(this, data);
    this.__insertModel(models);
    return models;
  }

  public add<T extends Model>(data: T): T;
  public add<T extends Model>(data: Array<T>): Array<T>;
  public add<T extends Model>(data: IRawModel|IDictionary<any>, model: IType|IModelConstructor<T>): T;
  public add<T extends Model>(data: Array<IRawModel|IDictionary<any>>, model: IType|IModelConstructor<T>): Array<T>;
  public add(
    data: Model|IRawModel|IDictionary<any>|Array<Model>|Array<IRawModel|IDictionary<any>>,
    model?: IType|IModelConstructor,
  ): Model|Array<Model> {
    this.__confirmValid();
    return (data instanceof Array) ? this.__addArray(data, model) : this.__addSingle(data, model);
  }

  public find(model: IType|typeof Model|Model, id?: IIdentifier): Model|null;
  public find(test: TFilterFn): Model|null;
  public find(model: IType|typeof Model|(TFilterFn), id?: IIdentifier): Model|null {
    return isSelectorFunction(model)
      ? this.__data.find(model as TFilterFn)
      : this.__findByType(model as typeof Model, id);
  }

  public filter(test: TFilterFn): Array<Model> {
    return this.__data.filter(test);
  }

  public findAll(model?: IType|typeof Model): Array<Model> {
    if (model) {
      const type = getModelType(model);
      return this.__dataList[type] || [];
    }
    return this.__data;
  }

  public hasItem(model: Model): boolean {
    const type = getModelType(model);
    const id = getModelId(model);
    return type in this.__dataMap && id in this.__dataMap[type];
  }

  public toJSON(): Array<IRawModel> {
    return this.__data.map(modelToJSON);
  }

  public remove(model: IType|typeof Model, id?: IIdentifier);
  public remove(model: Model);
  public remove(obj: IType|typeof Model|Model, id?: IIdentifier) {
    this.__confirmValid();
    const model = typeof obj === 'object' ? obj : this.find(obj, id);
    if (model) {
      this.__removeModel(model);
    }
  }

  @computed public get length(): number {
    return this.__data.length;
  }

  public destroy() {
    this.__confirmValid();
    storage.unregisterCollection(this);
    this.__initialized = false;
  }

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
