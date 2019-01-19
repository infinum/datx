import {
  getModelClassRefs,
  getModelId,
  getModelMetaKey,
  getModelType,
  ICollectionConstructor,
  IIdentifier,
  IModelConstructor,
  initModelRef,
  IReferenceOptions,
  IType,
  PureCollection,
  PureModel,
  ReferenceType,
  setModelMetaKey,
  updateModel,
} from 'datx';
import { IDictionary, IRawModel, mapItems } from 'datx-utils';
import { action } from 'mobx';

import { clearAllCache, clearCacheByType } from './cache';
import { MODEL_META_FIELD, MODEL_REF_META_FIELD } from './consts';
import { GenericModel } from './GenericModel';
import { flattenModel, removeModel } from './helpers/model';
import { buildUrl, prepareQuery } from './helpers/url';
import { isBrowser } from './helpers/utils';
import { IHeaders } from './interfaces/IHeaders';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IDefinition, IRecord, IRelationship, IRequest, IResponse } from './interfaces/JsonApi';
import { libFetch, read } from './NetworkUtils';
import { Response } from './Response';

export function decorateCollection(BaseClass: typeof PureCollection) {
  class JsonapiCollection extends BaseClass {
    public static types = (BaseClass.types && BaseClass.types.length)
      ? BaseClass.types.concat(GenericModel)
      : [GenericModel];

    public static cache: boolean = BaseClass['cache'] === undefined
      ? isBrowser
      : BaseClass['cache'];

    public static defaultModel = BaseClass['defaultModel'] || GenericModel;

    @action public sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T|Array<T>|null {
      if (!body) {
        return null;
      }
      const data: T|Array<T>|null = this.__iterateEntries(body, (obj: IRecord) => this.__addRecord<T>(obj));
      this.__iterateEntries(body, this.__updateRelationships.bind(this));

      return data;
    }

    /**
     * Fetch the records with the given type and id
     *
     * @param {string} type Record type
     * @param {number|string} type Record id
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public fetch<T extends IJsonapiModel = IJsonapiModel>(
      type: IType|IModelConstructor<T>,
      id: number|string,
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      const modelType = getModelType(type);
      const query = this.__prepareQuery(modelType, id, undefined, options);

      return read<T>(query.url, this, query.headers, options)
        .then((res) => this.__handleErrors<T>(res));
    }

    /**
     * Fetch the first page of records of the given type
     *
     * @param {string} type Record type
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public fetchAll<T extends IJsonapiModel = IJsonapiModel>(
      type: IType|IModelConstructor<T>,
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      const modelType = getModelType(type);
      const query = this.__prepareQuery(modelType, undefined, undefined, options);

      return read<T>(query.url, this, query.headers, options)
        .then((res) => this.__handleErrors<T>(res));
    }

    public request<T extends IJsonapiModel = IJsonapiModel>(
      url: string,
      method: string = 'GET',
      data?: object,
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      const query = buildUrl(url, data, options);

      return libFetch<T>({ url: query.url, options, data, method, collection: this });
    }

    public remove(type: IType|typeof PureModel, id?: IIdentifier, remote?: boolean|IRequestOptions);
    public remove(model: PureModel, remote?: boolean|IRequestOptions);
    @action public remove(
      obj: IType|typeof PureModel|PureModel,
      id?: IIdentifier|boolean|IRequestOptions,
      remote?: boolean|IRequestOptions,
    ) {
      const remove = (typeof id === 'boolean' || typeof id === 'object') ? id : remote;
      let modelId: number | string | undefined;
      if (typeof id === 'string' || typeof id === 'number') {
        modelId = id;
      } else if (typeof id === 'boolean' || obj instanceof PureModel) {
        modelId = getModelId(obj);
      }

      const type = getModelType(obj);
      const model = this.find(type, modelId);

      if (model && modelId !== undefined && getModelId(model) !== modelId) {
        // The model is not in the collection and we shouldn't remove a random one
        return Promise.resolve();
      }

      if (model && remove) {
        return removeModel(model, typeof remove === 'object' ? remove : undefined);
      }

      if (model) {
        super.remove(model);
      }
      clearCacheByType(type);

      return Promise.resolve();
    }

    @action public removeAll(type: string | number | typeof PureModel) {
      super.removeAll(type);
      clearCacheByType(getModelType(type));
    }

    @action public reset() {
      super.reset();
      clearAllCache();
    }

    /**
     * Function used to handle response errors
     *
     * @private
     * @param {Response} response API response
     * @returns API response
     */
    private __handleErrors<T extends IJsonapiModel>(response: Response<T>) {
      if (response.error) {
        throw response.error;
      }

      return response;
    }

    private __addRecord<T extends IJsonapiModel = IJsonapiModel>(obj: IRecord): T {
      const staticCollection = this.constructor as typeof PureCollection;
      const { type, id } = obj;
      let record: T|null = this.find(type, id) as T|null;
      const Type = staticCollection.types.find((item) => getModelType(item) === type) || GenericModel;
      const classRefs = getModelClassRefs(Type);
      const flattened: IRawModel = flattenModel(classRefs, obj);

      if (record) {
        updateModel(record, flattened);
      } else if (staticCollection.types.filter((item) => item.type === type).length) {
        record = this.add<T>(flattened, type);
      } else {
        record = this.add(new GenericModel(flattened)) as T;
      }

      return record;
    }

    private __updateRelationships(obj: IRecord): void {
      const record: PureModel|null = this.find(obj.type, obj.id);
      const refs: Array<string> = obj.relationships ? Object.keys(obj.relationships) : [];
      refs.forEach((ref: string) => {
        const refData = (obj.relationships as IDictionary<IRelationship>)[ref];
        if (!refData || !('data' in refData)) {
          return;
        }
        const items = refData.data;
        if (items instanceof Array && items.length < 1) {
          // it's only possible to update items with one ore more refs. Early exit
          return;
        } else if (record) {
          if (items) {
            const models: PureModel|Array<PureModel>|IIdentifier|null = mapItems(
              items,
              (def: IDefinition) => this.find(def.type, def.id) || def.id,
            ) || null;

            const itemType: string = items instanceof Array ? items[0].type : items.type;
            if (ref in record) {
              record[ref] = models;
            } else {
              initModelRef(record, ref, { model: itemType, type: ReferenceType.TO_ONE_OR_MANY }, models);
            }
          } else {
            const refsDef = getModelMetaKey(record, 'refs') as IDictionary<IReferenceOptions>;
            if (refsDef && ref in refsDef) {
              record[ref] = refsDef[ref].type === ReferenceType.TO_MANY ? [] : null;
            }
          }
        }
      });
    }

    private __iterateEntries<T extends IJsonapiModel>(body: IResponse, fn: (item: IRecord) => T): T | Array<T>;
    private __iterateEntries<T extends IJsonapiModel>(body: IResponse, fn: (item: IRecord) => void): void;
    private __iterateEntries<T extends IJsonapiModel>(body: IResponse, fn: (item: IRecord) => T) {
      mapItems((body && body.included) || [], fn);

      return mapItems((body && body.data) || [], fn);
    }

    private __prepareQuery(
      type: IType,
      id?: number|string,
      data?: IRequest,
      options?: IRequestOptions,
    ): {
      url: string;
      data?: object;
      headers: IHeaders;
    } {
      return prepareQuery(type, id, data, options, this);
    }
  }

  return JsonapiCollection as ICollectionConstructor<PureCollection & IJsonapiCollection>;
}
