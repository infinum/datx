import {computed, IObservableArray, observable} from 'mobx';

import {COLLECTION_DESTROYED, UNDEFINED_MODEL, UNDEFINED_TYPE} from './errors';
import {initCollectionModel, upsertModel} from './helpers/collection';
import {error} from './helpers/format';
import {getModelId, getModelType, modelToJSON, updateModel} from './helpers/model';
import {ICollection} from './interfaces/ICollection';
import {IDictionary} from './interfaces/IDictionary';
import {IIdentifier} from './interfaces/IIdentifier';
import {IModelConstructor} from './interfaces/IModelConstructor';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';
import {TFilterFn} from './interfaces/TFilterFn';
import {Model} from './Model';
import {storage} from './services/storage';

export class Collection implements ICollection {
  public static types: Array<typeof Model> = [];

  private __data: IObservableArray<Model> = observable.array([]);
  private __initialized: boolean = true;

  constructor(data: Array<IRawModel> = []) {
    this.insert(data);
    storage.registerCollection(this);
  }

  public insert(data: Array<IRawModel> = []): Array<Model> {
    this.__confirmValid();
    const staticCollection = this.constructor as typeof Collection;
    const models = data.map((item, index) => initCollectionModel(staticCollection, item, index));
    this.__data.push(...models);
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

  public find(model: IType|typeof Model, id?: IIdentifier): Model|null;
  public find(test: TFilterFn): Model|null;
  public find(
    model: IType|typeof Model|(TFilterFn),
    id?: IIdentifier,
  ): Model|null {
    if (typeof model === 'function') {
      if (model !== Model && !(model.prototype instanceof Model)) {
        return this.__data.find(model as TFilterFn);
      }
    }

    return this.__findByType(model as typeof Model, id);
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
      this.__data.remove(model);
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
  }

  private __confirmValid() {
    if (!this.__initialized) {
      throw error(COLLECTION_DESTROYED);
    }
  }

  @computed private get __dataMap(): IDictionary<IDictionary<Model>> {
    const map = {};

    this.__data.forEach((model) => {
      const type = getModelType(model);
      const id = getModelId(model);
      map[type] = map[type] || {};
      map[type][id] = model;
    });

    return map;
  }

  @computed private get __dataList(): IDictionary<Array<Model>> {
    const list = {};

    this.__data.forEach((model) => {
      const type = getModelType(model);
      const id = getModelId(model);
      list[type] = list[type] || [];
      list[type].push(model);
    });

    return list;
  }

  private __addArray<T extends Model>(data: Array<T>): Array<T>;
  private __addArray<T extends Model>(data: Array<IDictionary<any>>, model?: IType|IModelConstructor<T>): Array<T>;
  private __addArray(
    data: Array<Model|IDictionary<any>>,
    model?: IType|IModelConstructor,
  ): Array<Model> {
    return data.map((item) => {
      if (item instanceof Model) {
        this.__data.push(item);
        return item;
      } else if (model) {
        return this.add(item, model);
      }
      throw error(UNDEFINED_TYPE);
    });
  }

  private __addSingle<T extends Model>(data: T): T;
  private __addSingle<T extends Model>(data: IDictionary<any>, model?: IType|IModelConstructor<T>): T;
  private __addSingle(data: Model|IDictionary<any>, model?: IType|IModelConstructor) {
    if (data instanceof Model) {
      this.__data.push(data);
      return data;
    }

    if (!model) {
      throw error(UNDEFINED_TYPE);
    }

    const type = getModelType(model as IType|typeof Model);
    const modelInstance = upsertModel(data, type, this.constructor as typeof Collection);
    this.__data.push(modelInstance);
    return modelInstance;
  }

  private __findByType(model: IType|typeof Model, id?: IIdentifier) {
    const type = getModelType(model as typeof Model);

    if (id) {
      const models = this.__dataMap[type] || {};
      return models[id] || null;
    } else {
      const data = this.__dataList[type] || [];
      return data[0] || null;
    }
  }
}
