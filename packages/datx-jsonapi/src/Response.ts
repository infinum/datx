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
import type { IError, IJsonApiObject, ILink } from '@datx/jsonapi-types';

import { IHeaders } from './interfaces/IHeaders';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IRawResponse } from './interfaces/IRawResponse';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IResponseInternal } from './interfaces/IResponseInternal';

import { GenericModel } from './GenericModel';
import { flattenModel } from './helpers/model';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { fetchLink } from './NetworkUtils';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';

function serializeHeaders(
  headers: Array<[string, string]> | IResponseHeaders,
): Array<[string, string]> {
  if (headers instanceof Array) {
    return headers;
  }

  const list: Array<[string, string]> = [];

  if (!headers.forEach) {
    return list;
  }
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

function initData<T extends IJsonapiModel>(
  response: IRawResponse,
  collection?: IJsonapiCollection,
  overrideData?: T | Array<T>,
): any {
  if (collection && response.data) {
    const data = overrideData || collection.sync<T>(response.data);

    return new Bucket.ToOneOrMany<T>(data, collection as any, true);
  }

  if (response.data) {
    // The case when a record is not in a store and save/remove are used
    const resp = response.data;

    if (resp.data) {
      if (resp.data instanceof Array) {
        throw new Error('A save/remove operation should not return an array of results');
      }

      return {
        value: overrideData || (new GenericModel(flattenModel(undefined, resp.data)) as T),
      };
    }
  }

  return new Bucket.ToOneOrMany<T>(null, collection as any, true);
}

type IAsync<T extends IJsonapiModel> = Promise<Response<T>>;

export class Response<T extends IJsonapiModel, P = IAsync<T>> {
  private readonly __data;

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
  public first?: () => P; // Handled by the __fetchLink

  /**
   * Previous data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public prev?: () => P; // Handled by the __fetchLink

  /**
   * Next data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public next?: () => P; // Handled by the __fetchLink

  /**
   * Last data page
   *
   * @type {P<Response>}
   * @memberOf Response
   */
  public last?: () => P; // Handled by the __fetchLink

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
  protected readonly __cache: Record<string, () => P> = {};

  constructor(
    response: IRawResponse,
    collection?: IJsonapiCollection,
    options?: IRequestOptions,
    overrideData?: T | Array<T>,
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

  public get data(): T | Array<T> | null {
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
  public replaceData(data: T): Response<T, P> {
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

  public clone(): Response<T> {
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

  public update(response: IRawResponse, views?: Array<View>): Response<T, P> {
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
  protected __fetchLink(name: string): () => P {
    const ResponseConstructor: typeof Response = this.constructor as typeof Response;
    if (!this.__cache[name]) {
      const link: ILink | null = this.links && name in this.links ? this.links[name] : null;

      if (link) {
        const options = Object.assign({}, this.__internal.options);

        options.networkConfig = options.networkConfig || {};
        options.networkConfig.headers = this.requestHeaders;
        this.__cache[name] = (): P =>
          fetchLink<T>(
            link,
            this.collection,
            options,
            this.views,
            ResponseConstructor,
          ) as unknown as P;
      }
    }

    return this.__cache[name];
  }
}
