import {computed, IObservableArray, observable} from 'mobx';

import {UNDEFINED_MODEL, UNDEFINED_TYPE} from './errors';
import {initCollectionModel} from './helpers/collection';
import {error} from './helpers/format';
import {getModelId, getModelType} from './helpers/model';
import {ICollection} from './interfaces/ICollection';
import {IDictionary} from './interfaces/IDictionary';
import {IIdentifier} from './interfaces/IIdentifier';
import {IRawModel} from './interfaces/IRawModel';
import {IType} from './interfaces/IType';
import {TFilterFn} from './interfaces/TFilterFn';
import {Model} from './Model';
import {storage} from './services/storage';

export class Collection implements ICollection {
  public static types: Array<typeof Model> = [];

  private __data: IObservableArray<Model> = observable.array([]);

  constructor(data: Array<IRawModel> = []) {
    this.__data.replace(data.map((item, index) => initCollectionModel(this, item, index)));
    storage.registerCollection(this);
  }

  public add<T extends Model>(data: T): T;
  public add<T extends Model>(data: Array<T>): Array<T>;
  public add<T extends Model>(data: IDictionary<any>, model: IType|{new(): T}): T;
  public add<T extends Model>(data: Array<IDictionary<any>>, model: IType|{new(): T}): Array<T>;
  public add(
    data: Model|IDictionary<any>|Array<Model>|Array<IDictionary<any>>,
    model?: IType|{new(): Model},
  ): Model|Array<Model> {
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
    return this.__data.map((model) => model.toJSON());
  }

  public remove(model: IType|typeof Model, id?: IIdentifier);
  public remove(model: Model);
  public remove(obj: IType|typeof Model|Model, id?: IIdentifier) {
    const model = typeof obj === 'object' ? obj : this.find(obj, id);
    if (model) {
      this.__data.remove(model);
    }
  }

  @computed public get length(): number {
    return this.__data.length;
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
  private __addArray<T extends Model>(data: Array<IDictionary<any>>, model?: IType|{new(): T}): Array<T>;
  private __addArray(
    data: Array<Model>|Array<IDictionary<any>>,
    model?: IType|{new(): Model},
  ): Array<Model> {
    // @ts-ignore
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
  private __addSingle<T extends Model>(data: IDictionary<any>, model?: IType|{new(): T}): T;
  private __addSingle(data: Model|IDictionary<any>, model?: IType|{new(): Model}) {
    if (data instanceof Model) {
      this.__data.push(data);
      return data;
    }

    if (!model) {
      throw error(UNDEFINED_TYPE);
    }

    const type = getModelType(model as IType|typeof Model);
    const TypeModel = (this.constructor as typeof Collection).types.find((item) => item.type === type);

    if (!type) {
      throw error(UNDEFINED_TYPE);
    }

    if (!TypeModel) {
      throw error(UNDEFINED_MODEL, {type});
    }

    const modelInstance = new TypeModel(data);
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
