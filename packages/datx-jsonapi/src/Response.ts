import {
  Bucket,
  getModelId,
  getModelType,
  modelToJSON,
  PureModel,
  updateModel,
  updateModelId,
  View,
} from '@datx/core';
import { assignComputed, Headers, IResponseHeaders } from '@datx/utils';

import { IHeaders } from './interfaces/IHeaders';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IRawResponse } from './interfaces/IRawResponse';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IError, IJsonApiObject, ILink } from './interfaces/JsonApi';
import { IResponseInternal } from './interfaces/IResponseInternal';

import { GenericModel } from './GenericModel';
import { flattenModel } from './helpers/model';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { fetchLink } from './NetworkUtils';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';
import { IResponseData } from '.';

function serializeHeaders(
  headers: Array<[string, string]> | IResponseHeaders,
): Array<[string, string]> {
  if (headers instanceof Array) {
    return headers;
  }

  const list: Array<[string, string]> = [];

  headers.forEach((value: string, key: string) => {
    list.push([key, value]);
  });

  return list;
}

function initHeaders(headers: Array<[string, string]> | IResponseHeaders): IResponseHeaders {
  if (headers instanceof Array) {
    return new Headers(headers);
  }

  return headers;
}

function initData<TModel extends IJsonapiModel>(
  response: IRawResponse,
  collection?: IJsonapiCollection,
  overrideData?: IResponseData<TModel>,
): any {
  if (collection && response.data) {
    const data = overrideData || collection.sync<TModel>(response.data);

    return new Bucket.ToOneOrMany<TModel>(data, collection as any, true);
  }

  if (response.data) {
    // The case when a record is not in a store and save/remove are used
    const resp = response.data;

    if (resp.data) {
      if (resp.data instanceof Array) {
        throw new Error('A save/remove operation should not return an array of results');
      }

      return {
        value: overrideData || (new GenericModel(flattenModel(undefined, resp.data)) as TModel),
      };
    }
  }

  return new Bucket.ToOneOrMany<TModel>(null, collection as any, true);
}

type IAsync<TModel extends IJsonapiModel, TData extends IResponseData = IResponseData<TModel>> = Promise<Response<TModel, TData>>;

export class Response<TModel extends IJsonapiModel = IJsonapiModel, TData extends IResponseData = IResponseData<TModel>, TAsync = IAsync<TModel, TData>> {
  private __data;

  protected __internal: IResponseInternal = {
    response: {},
    views: [],
  };

  /**
   * API response metadata
   *
   * @type {object}
   * @memberOf Response
   */
  public get meta(): object | undefined {
    return this.__internal.meta;
  }

  /**
   * API response links
   *
   * @type {object}
   * @memberOf Response
   */
  public get links(): Record<string, ILink> | undefined {
    return this.__internal.links;
  }

  /**
   * The JSON API object returned by the server
   *
   * @type {JsonApi.IJsonApiObject}
   * @memberOf Response
   */
  public get jsonapi(): IJsonApiObject | undefined {
    return this.__internal.jsonapi;
  }

  /**
   * Headers received from the API call
   *
   * @type {IResponseHeaders}
   * @memberOf Response
   */
  public get headers(): IResponseHeaders | undefined {
    return this.__internal.headers;
  }

  /**
   * Headers sent to the server
   *
   * @type {IHeaders}
   * @memberOf Response
   */
  public get requestHeaders(): IHeaders | undefined {
    return this.__internal.requestHeaders;
  }

  /**
   * Request error
   *
   * @type {(Array<JsonApi.IError>|Error)}
   * @memberOf Response
   */
  public get error(): Array<IError> | Error | undefined {
    return this.__internal.error;
  }

  /**
   * First data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public first?: () => TAsync; // Handled by the __fetchLink

  /**
   * Previous data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public prev?: () => TAsync; // Handled by the __fetchLink

  /**
   * Next data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public next?: () => TAsync; // Handled by the __fetchLink

  /**
   * Last data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public last?: () => TAsync; // Handled by the __fetchLink

  /**
   * Received HTTP status
   *
   * @type {number}
   * @memberOf Response
   */
  public get status(): number | undefined {
    return this.__internal.status;
  }

  public get views(): Array<View> {
    return this.__internal.views;
  }

  /**
   * Related Store
   *
   * @type {IJsonapiCollection}
   * @memberOf Response
   */
  public readonly collection?: IJsonapiCollection;

  /**
   * Cache used for the link requests
   *
   * @protected
   * @type {Record<string, P<Response>>}
   * @memberOf Response
   */
  protected readonly __cache: Record<string, () => TAsync> = {};

  constructor(
    response: IRawResponse,
    collection?: IJsonapiCollection,
    options?: IRequestOptions,
    overrideData?: IResponseData<TModel>,
    views?: Array<View>,
  ) {
    this.collection = collection;
    this.__updateInternal(response, options, views);
    this.__data = initData(response, collection, overrideData);

    this.views.forEach((view) => {
      if (this.__data.value) {
        view.add(this.__data.value);
      }
    });

    Object.freeze(this);

    if (this.error) {
      throw this;
    }
  }

  public get isSuccess(): boolean {
    return !this.error;
  }

  public get data(): TData {
    return this.__data.value;
  }

  private __updateInternal(
    response: IRawResponse,
    options?: IRequestOptions,
    views?: Array<View>,
  ): void {
    if (options) {
      this.__internal.options = options;
    }

    this.__internal.response = response;
    this.__internal.meta = response.data?.meta || {};
    this.__internal.links = response.data?.links || {};
    this.__internal.jsonapi = response.data?.jsonapi || {};
    this.__internal.headers = response.headers && initHeaders(response.headers);
    this.__internal.requestHeaders = response.requestHeaders;
    this.__internal.error = response.data?.errors || response.error;
    this.__internal.status = response.status;

    if (views) {
      this.__internal.views = views;
    }

    if (!this.error && !this.status) {
      this.__internal.error = new Error('Network not available');
    }

    if (this.links) {
      Object.keys(this.links).forEach((link: string) => {
        assignComputed(this, link, () => this.__fetchLink(link));
      });
    }
  }

  /**
   * Replace the response record with a different record. Used to replace a record while keeping the same reference
   *
   * @param {PureModel} data New data
   * @returns {Response}
   *
   * @memberOf Response
   */
  public replaceData(data: TModel): Response<TModel, TData, TAsync> {
    const record: PureModel = this.data as PureModel;

    if (record === data) {
      return this;
    }

    const newId = getModelId(record).toString();
    const type = getModelType(record);

    const viewIndexes = this.views.map((view) => view.list.indexOf(record));

    if (this.collection) {
      this.collection.removeOne(type, newId);
      this.collection.add(data);
    }

    const rawData = modelToJSON(record);
    delete rawData?.['__META__']?.collection;

    updateModel(data, rawData);

    updateModelId(data, newId);

    this.views.forEach((view, index) => {
      if (viewIndexes[index] !== -1) {
        view.list[viewIndexes[index]] = data;
      }
    });

    const ResponseConstructor: typeof Response = this.constructor as typeof Response;
    return new ResponseConstructor(
      this.__internal.response,
      this.collection,
      this.__internal.options,
      data,
    );
  }

  public clone(): Response<TModel> {
    const ResponseConstructor: typeof Response = this.constructor as typeof Response;
    return new ResponseConstructor(
      this.__internal.response,
      this.collection,
      this.__internal.options,
      this.data || undefined,
    );
  }

  public get snapshot(): IResponseSnapshot {
    return {
      response: Object.assign({}, this.__internal.response, {
        headers:
          this.__internal.response.headers && serializeHeaders(this.__internal.response.headers),
        collection: undefined,
      }),
      options: this.__internal.options,
    };
  }

  public update(response: IRawResponse, views?: Array<View>): Response<TModel, TData, TAsync> {
    this.__updateInternal(response, undefined, views);
    const newData = initData(response, this.collection);

    this.__data.__readonlyValue = newData.value;

    return this;
  }

  /**
   * Function called when a link is being fetched. The returned value is cached
   *
   * @protected
   * @param {string} name Link name
   * @returns P that resolves with a Response object
   *
   * @memberOf Response
   */
  protected __fetchLink(name: string): () => TAsync {
    const ResponseConstructor: typeof Response = this.constructor as typeof Response;
    if (!this.__cache[name]) {
      const link: ILink | null = this.links && name in this.links ? this.links[name] : null;

      if (link) {
        const options = Object.assign({}, this.__internal.options);

        options.networkConfig = options.networkConfig || {};
        options.networkConfig.headers = this.requestHeaders;
        this.__cache[name] = (): TAsync =>
          fetchLink<TModel>(link, this.collection, options, this.views, ResponseConstructor) as unknown as TAsync;
      }
    }

    return this.__cache[name];
  }
}
