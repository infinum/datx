import {
  getModelClassRefs,
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
  updateModel,
  View,
} from 'datx';
import {IDictionary, IRawModel, mapItems} from 'datx-utils';
import {action} from 'mobx';

import {clearAllCache, clearCacheByType} from './cache';
import {URL_REGEX} from './consts';
import {ParamArrayType} from './enums/ParamArrayType';
import {GenericModel} from './GenericModel';
import {flattenModel, removeModel} from './helpers/model';
import {getValue, isBrowser} from './helpers/utils';
import {IFilters} from './interfaces/IFilters';
import {IHeaders} from './interfaces/IHeaders';
import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {IRequestOptions} from './interfaces/IRequestOptions';
import {IDefinition, IRecord, IRelationship, IRequest, IResponse} from './interfaces/JsonApi';
import {config, libFetch, read} from './NetworkUtils';
import {Response} from './Response';

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
      view?: View,
    ): Promise<Response<T>> {
      const modelType = getModelType(type);
      const query = this.__prepareQuery(modelType, id, undefined, options);

      return read<T>(query.url, this, query.headers, options, view)
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
      view?: View,
    ): Promise<Response<T>> {
      const modelType = getModelType(type);
      const query = this.__prepareQuery(modelType, undefined, undefined, options);

      return read<T>(query.url, this, query.headers, options, view)
        .then((res) => this.__handleErrors<T>(res));
    }

    public fetchPage<T extends IJsonapiModel = IJsonapiModel>(
      type: IType|IModelConstructor<T>,
      pageNumber: number = 1,
      pageSize: number = config.defaultPerPage,
      options?: IRequestOptions,
      view?: View,
    ): Promise<Response<T>> {
      const modelType = getModelType(type);
      if (!config.getPaginationParams) {
        throw new Error('Implement `config.getPaginationParams` before using `fetchPage`');
      }
      const pagination = config.getPaginationParams(pageNumber, pageSize);

      const query = this.__prepareQuery(modelType, undefined, undefined, {
        ...options,
        params: ([] as Array<string | {key: string; value: string}>)
          .concat((options && options.params) || [], pagination),
      });

      return read<T>(query.url, this, query.headers, options, view)
        .then((res) => this.__handleErrors<T>(res));
    }

    public request<T extends IJsonapiModel = IJsonapiModel>(
      url: string,
      method: string = 'GET',
      data?: object,
      options?: IRequestOptions,
      view?: View,
    ): Promise<Response<T>> {
      const query = this.__buildUrl(url, data, options);

      return libFetch<T>({url: query.url, options, data, method, collection: this, view});
    }

    public remove(type: IType|typeof PureModel, id?: IIdentifier, remote?: boolean|IRequestOptions);
    public remove(model: PureModel, remote?: boolean|IRequestOptions);
    @action public remove(
      obj: IType|typeof PureModel|PureModel,
      id?: IIdentifier|boolean|IRequestOptions,
      remote?: boolean|IRequestOptions,
    ) {
      const remove = (typeof id === 'boolean' || typeof id === 'object') ? id : remote;
      const modelId = (typeof id !== 'boolean' && typeof id !== 'object') ? id : undefined;
      const type = getModelType(obj);
      const model = this.find(type, modelId);

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
      const {type, id} = obj;
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
              initModelRef(record, ref, {model: itemType, type: ReferenceType.TO_ONE_OR_MANY}, models);
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

    private __iterateEntries<T extends IJsonapiModel>(body: IResponse, fn: (item: IRecord) => T): Array<T>;
    private __iterateEntries<T extends IJsonapiModel>(body: IResponse, fn: (item: IRecord) => void): void;
    private __iterateEntries<T extends IJsonapiModel>(body: IResponse, fn: (item: IRecord) => T | void) {
      mapItems((body && body.included) || [], fn);

      return mapItems((body && body.data) || [], fn);
    }

    private __prepareQuery(type: IType, id?: number|string, data?: IRequest, options?: IRequestOptions): {
      url: string;
      data?: object;
      headers: IHeaders;
    } {
      const staticCollection = this.constructor as typeof PureCollection;
      const model: PureModel = staticCollection.types.filter((item) => item.type === type)[0];
      const path: string = model
        ? (getValue<string>(model['endpoint']) || model['baseUrl'] || getModelType(model))
        : type;

      const url: string = id ? `${path}/${id}` : `${path}`;

      return this.__buildUrl(url, data, options);
    }

    private __buildUrl(url: string, data?: IRequest, options?: IRequestOptions) {
      const headers: IDictionary<string> = (options && options.headers) || {};

      const params: Array<string> = [
        ...this.__prepareFilters((options && options.filter) || {}),
        ...this.__prepareSort(options && options.sort),
        ...this.__prepareIncludes(options && options.include),
        ...this.__prepareFields((options && options.fields) || {}),
        ...this.__prepareRawParams((options && options.params) || []),
      ];

      const baseUrl: string = this.__appendParams(this.__prefixUrl(url), params);

      return {data, headers, url: baseUrl};
    }

    private __prepareFilters(filters: IFilters): Array<string> {
      return this.__parametrize(filters).map((item) => `filter[${item.key}]=${item.value}`);
    }

    private __prepareSort(sort?: string|Array<string>): Array<string> {
      return sort ? [`sort=${sort}`] : [];
    }

    private __prepareIncludes(include?: string|Array<string>): Array<string> {
      return include ? [`include=${include}`] : [];
    }

    private __prepareFields(fields: IDictionary<string|Array<string>>): Array<string> {
      const list: Array<string> = [];

      Object.keys(fields).forEach((key) => {
        list.push(`fields[${key}]=${fields[key]}`);
      });

      return list;
    }

    private __prepareRawParams(params: Array<{key: string; value: string}|string>): Array<string> {
      return params.map((param) => {
        if (typeof param === 'string') {
          return param;
        }

        return `${param.key}=${param.value}`;
      });
    }

    private __prefixUrl(url: string) {
      if (URL_REGEX.test(url)) {
        return url;
      }

      return `${config.baseUrl}${url}`;
    }

    private __appendParams(url: string, params: Array<string>): string {
      let newUrl = url;
      if (params.length) {
        const separator = newUrl.indexOf('?') === -1 ? '?' : '&';
        newUrl += separator + params.join('&');
      }

      return newUrl;
    }

    private __parametrize(params: object, scope: string = '') {
      const list: Array<{key: string; value: string}> = [];

      Object.keys(params).forEach((key) => {
        if (params[key] instanceof Array) {
          if (config.paramArrayType === ParamArrayType.OBJECT_PATH) {
            list.push(...this.__parametrize(params[key], `${key}.`));
          } else if (config.paramArrayType === ParamArrayType.COMMA_SEPARATED) {
            list.push({key: `${scope}${key}`, value: params[key].join(',')});
          } else if (config.paramArrayType === ParamArrayType.MULTIPLE_PARAMS) {
            list.push(...params[key].map((param) => ({key: `${scope}${key}`, value: param})));
          } else if (config.paramArrayType === ParamArrayType.PARAM_ARRAY) {
            list.push(...params[key].map((param) => ({key: `${scope}${key}][`, value: param})));
          }
        } else if (typeof params[key] === 'object') {
          list.push(...this.__parametrize(params[key], `${key}.`));
        } else {
          list.push({key: `${scope}${key}`, value: params[key]});
        }
      });

      return list;
    }
  }

  return JsonapiCollection as ICollectionConstructor<PureCollection & IJsonapiCollection>;
}
