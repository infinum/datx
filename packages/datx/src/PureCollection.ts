import { IRawModel, getMeta, setMeta, isArrayLike, mobx, IObservable, IObservableArray, removeFromArray, replaceInArray } from '@datx/utils';

import { PureModel } from './PureModel';
import { IType } from './interfaces/IType';
import { TFilterFn } from './interfaces/TFilterFn';
import { IIdentifier } from './interfaces/IIdentifier';
import { IModelRef } from './interfaces/IModelRef';
import { IModelConstructor } from './interfaces/IModelConstructor';
import {
  isModelReference,
  getModelType,
  getModelId,
  getModelCollection,
  updateModel,
  updateModelCollection,
  modelToJSON,
} from './helpers/model/utils';
import { PatchType } from './enums/PatchType';
import { triggerAction } from './helpers/patch';
import { upsertModel, initModels } from './helpers/collection';
import { MetaClassField } from './enums/MetaClassField';
import { IFieldDefinition } from './Attribute';
import { IBucket } from './interfaces/IBucket';
import { MetaModelField } from './enums/MetaModelField';
import { IRawView } from './interfaces/IRawView';
import { IRawCollection } from './interfaces/IRawCollection';
import { View } from './View';
import { error } from './helpers/format';

export class PureCollection {
  public static types: Array<typeof PureModel> = [];

  public static defaultModel?: typeof PureModel = PureModel;

  public static views: Record<
    string,
    {
      modelType: IType | PureModel;
      sortMethod?: string | ((PureModel) => any);
      unique?: boolean;
      mixins?: Array<(view: any) => any>;
    }
  > = {};

  private readonly __data: IObservableArray<PureModel> = mobx.observable.array([], { deep: false });

  private readonly __views: Array<string> = [];

  private __dataMap: Record<string, Record<string, PureModel>> = (mobx.observable.object({}, undefined, {
    deep: false,
  }) as unknown) as Record<string, Record<string, PureModel>>;

  private __dataList: Record<string, IObservableArray<PureModel>> = (mobx.observable.object({}, undefined, {
    deep: false,
  }) as unknown) as Record<string, IObservableArray<PureModel>>;

  constructor(data: Array<IRawModel> | IRawCollection = []) {
    mobx.extendObservable(this, {});
    if (isArrayLike(data)) {
      this.insert(data as Array<IRawModel>);
    } else if (data && 'models' in data) {
      this.insert(data.models);
    }

    const staticCollection = this.constructor as typeof PureCollection;
    const initViews = data && 'views' in data ? data.views : {};

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

  public addView<T extends PureModel = PureModel>(
    name: string,
    type: IModelConstructor<T> | IType,
    {
      sortMethod,
      models = [],
      unique,
      mixins,
    }: {
      sortMethod?: string | ((item: T) => any);
      models?: Array<IIdentifier | T>;
      unique?: boolean;
      mixins?: Array<(view: any) => any>;
    } = {},
  ): View<T> {
    if (name in this && this[name]) {
      throw error('The name is already taken');
    }

    const ViewConstructor = mixins
      ? (mixins.reduce((view: any, mixin: (view: any) => any) => {
          return mixin(view);
        }, View) as typeof View)
      : View;

    this.__views.push(name);
    this[name] = new ViewConstructor<T>(type, this, sortMethod, models, unique);

    return this[name];
  }

  /**
   * Function for inserting raw models into the collection. Used when hydrating the collection
   *
   * @param {Array<IRawModel>} data Raw model data
   * @returns {Array<PureModel>} A list of initialized models
   * @memberof Collection
   */
  public insert(data: Array<Partial<IRawModel>>): Array<PureModel> {
    const models = initModels(this, data);

    this.__insertModel(models);

    return models;
  }

  public hasItem(model: PureModel): boolean {
    const id = getModelId(model);

    return Boolean(this.findOne(model, id));
  }

  public add<T extends PureModel>(data: T): T;

  public add<T extends PureModel>(data: Array<T>): Array<T>;

  public add<T extends PureModel>(
    data: Array<IRawModel | Record<string, any>>,
    model: IType | IModelConstructor<T>,
  ): Array<T>;

  public add<T extends PureModel>(
    data: IRawModel | Record<string, any>,
    model: IType | IModelConstructor<T>,
  ): T;

  public add(
    data:
      | PureModel
      | IRawModel
      | Record<string, any>
      | Array<PureModel | IRawModel | Record<string, any>>,
    model?: IType | IModelConstructor,
  ): PureModel | Array<PureModel> {
    return isArrayLike(data)
      ? this.__addArray(data as Array<PureModel | IRawModel | Record<string, any>>, model)
      : this.__addSingle(data, model);
  }

  public filter(test: TFilterFn): Array<PureModel> {
    return this.__data.filter(test);
  }

  public findOne<T extends PureModel>(
    type: IType | T | IModelConstructor<T>,
    id: IIdentifier | PureModel,
  ): T | null;

  public findOne<T extends PureModel>(ref: IModelRef): T | null;

  public findOne(
    model: IType | typeof PureModel | IModelRef,
    id?: IIdentifier | PureModel,
  ): PureModel | null {
    if (id instanceof PureModel) {
      return id;
    }

    if (isModelReference(model)) {
      return this.__findOneByType((model as IModelRef).type, (model as IModelRef).id);
    }

    if (id === null || id === undefined) {
      // ID mybe `""` or `0`
      throw new Error('The identifier is missing');
    }

    return this.__findOneByType(model as typeof PureModel, id);
  }

  public findAll<T extends PureModel>(model?: IType | IModelConstructor<T>): IObservableArray<T> {
    if (model) {
      const type = getModelType(model);

      if (!(type in this.__dataList)) {
        mobx.runInAction(() => {
          mobx.set(this.__dataList, { [type]: mobx.observable.array([]) });
        });
      }

      return this.__dataList[type] as IObservableArray<T>;
    }

    return this.__data as IObservableArray<T>;
  }

  public find(test: TFilterFn): PureModel | null {
    return this.__data.find(test) || null;
  }

  public removeOne(type: IType | typeof PureModel, id: IIdentifier): void;

  public removeOne(model: PureModel | IModelRef): void;

  public removeOne(obj: IType | typeof PureModel | PureModel | IModelRef, id?: IIdentifier): void {
    let model: PureModel | null = null;

    if (typeof obj === 'object') {
      model = obj;
    } else if (id) {
      model = this.findOne(obj, id);
    }
    if (model) {
      this.__removeModel(model);
    }
  }

  public removeAll(type: IType | typeof PureModel): void {
    this.__removeModel(this.findAll(type).slice());
  }

  public reset(): void {
    this.__data.forEach((model) => {
      setMeta(model, MetaModelField.Collection, undefined);

      triggerAction(
        {
          oldValue: modelToJSON(model) as Record<string, any>,
          patchType: PatchType.REMOVE,
        },
        model,
      );
    });
    replaceInArray(this.__data, []);
    this.__dataList = (mobx.observable.object({}, {}, { deep: false }) as unknown) as IObservable &
      Record<string, IObservableArray<PureModel>>;
    this.__dataMap = (mobx.observable.object({}, {}, { deep: false }) as unknown) as IObservable &
      Record<string, Record<string, PureModel>>;
  }

  public toJSON(): IRawCollection {
    const views: Record<string, IRawView> = {};

    this.__views.forEach((key) => {
      views[key] = this[key].toJSON();
    });

    return {
      models: this.__data.map(modelToJSON),
      views,
    };
  }

  public get snapshot(): IRawCollection {
    return this.toJSON();
  }

  @mobx.computed
  public get length(): number {
    return this.__data.length;
  }

  public getAllModels(): Array<PureModel> {
    return this.__data.slice();
  }

  private __findOneByType(
    model: IType | typeof PureModel | PureModel,
    id: IIdentifier,
  ): PureModel | null {
    const type = getModelType(model);

    if (!type) {
      return null;
    }
    const stringType = type.toString();
    const stringId = id.toString();

    mobx.runInAction(() => {
      if (!(type in this.__dataMap)) {
        mobx.set(
          this.__dataMap,
          stringType,
          mobx.observable.object({ [stringId]: null }, {}, { deep: false }),
        );
      } else if (!(stringId in this.__dataMap[stringType])) {
        mobx.set(this.__dataMap[stringType], stringId, null);
      }
    });

    return this.__dataMap[stringType][stringId] || null;
  }

  private __addArray<T extends PureModel>(data: Array<T>): Array<T>;

  private __addArray<T extends PureModel>(
    data: Array<Record<string, any>>,
    model?: IType | IModelConstructor<T>,
  ): Array<T>;

  private __addArray(
    data: Array<PureModel | Record<string, any>>,
    model?: IType | IModelConstructor,
  ): Array<PureModel> {
    return data.filter(Boolean).map((item) => this.__addSingle(item, model));
  }

  private __addSingle<T extends PureModel>(data: T): T;

  private __addSingle<T extends PureModel>(
    data: Record<string, any>,
    model?: IType | IModelConstructor<T>,
  ): T;

  private __addSingle(
    data: PureModel | Record<string, any> | IIdentifier | IModelRef,
    model?: number | IType | IModelConstructor,
  ): PureModel {
    if (!data || typeof data === 'number' || typeof data === 'string' || isModelReference(data)) {
      return data;
    }

    if (data instanceof PureModel) {
      if (!this.hasItem(data)) {
        this.__insertModel(data);
      }

      return data;
    }

    if (!model && model !== 0) {
      throw error('The type needs to be defined if the object is not an instance of the model.');
    }

    const type = getModelType(model as IType | typeof PureModel);
    const modelInstance = upsertModel(data, type, this);

    const collectionTypes = (this.constructor as typeof PureCollection).types.map(getModelType);
    if (!collectionTypes.includes(type) && (typeof model === 'object' || typeof model === 'function')) {
      throw new Error(`The model type ${type} was not found. Did you forget to add it to collection types?`);
    }

    this.__insertModel(modelInstance, type);

    return modelInstance;
  }

  protected __removeModel(model: PureModel | Array<PureModel>, type?: IType, id?: IIdentifier): void {
    if (isArrayLike(model)) {
      (model as Array<PureModel>).forEach((item) => {
        this.__removeModel(item, type, id);
      });

      return;
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);

    triggerAction(
      {
        oldValue: mobx.toJS(modelToJSON(model)) as Record<string, any>,
        patchType: PatchType.REMOVE,
      },
      model,
    );

    mobx.runInAction(() => {
      removeFromArray(this.__data, model);
      removeFromArray(this.__dataList[modelType], model);
      mobx.set(this.__dataMap[modelType], modelId.toString(), undefined);
    });

    this.__data.forEach((item) => {
      const fields = getMeta<Record<string, IFieldDefinition>>(
        item,
        MetaClassField.Fields,
        {},
        true,
        true,
      );
      const refKeys = Object.keys(fields || {});

      refKeys
        .map((key) => getMeta(item, `ref_${key}`))
        .filter(Boolean)
        .forEach((bucket: IBucket<PureModel>) => {
          if (isArrayLike(bucket.value) && (bucket.value as Array<PureModel>).includes(item)) {
            bucket.value = (bucket.value as Array<PureModel>).filter(
              (bucketModel) => bucketModel !== item,
            );
          } else if (bucket.value === item) {
            bucket.value = null;
          }
        });
    });

    updateModelCollection(model, undefined);
  }

  private __insertModel(model: PureModel | Array<PureModel>, type?: IType, id?: IIdentifier): void {
    if (isArrayLike(model)) {
      (model as Array<PureModel>).forEach((item) => {
        this.__insertModel(item, type, id);
      });

      return;
    }

    const collection = getModelCollection(model);

    if (collection && collection !== this) {
      throw error('A model can be in a single collection at once');
    }

    const modelType = type || getModelType(model);
    const modelId = id || getModelId(model);
    const stringType = modelType.toString();

    const existingModel = this.findOne(modelType, modelId);

    if (existingModel) {
      if (existingModel !== model) {
        updateModel(existingModel, model);
      }
      return;
    }

    mobx.runInAction(() => {
      this.__data.push(model);
      if (modelType in this.__dataList) {
        this.__dataList[modelType].push(model);
      } else {
        mobx.set(this.__dataList, stringType, mobx.observable.array([model], { deep: false }));
      }

      if (modelType in this.__dataMap) {
        mobx.set(this.__dataMap[modelType], modelId.toString(), model);
      } else {
        mobx.set(
          this.__dataMap,
          stringType,
          mobx.observable.object({ [modelId]: model }, {}, { deep: false }),
        );
      }
      updateModelCollection(model, this);
    });

    triggerAction(
      {
        newValue: modelToJSON(model) as Record<string, any>,
        patchType: PatchType.CRATE,
      },
      model,
    );
  }

  // @ts-ignore - Used outside of the class, but marked as private to avoid undocumented use
  private __changeModelId(oldId: IIdentifier, newId: IIdentifier, type: IType): void {
    this.__dataMap[type][newId] = this.__dataMap[type][oldId];
    delete this.__dataMap[type][oldId];
  }
}
