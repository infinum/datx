import {
  PureModel,
  PureCollection,
  View,
  Bucket,
  getModelId,
  getModelType,
  updateModel,
  modelToJSON,
  updateModelId,
} from 'datx';
import { IResponseHeaders } from './interfaces/IResponseHeaders';
import { IHeaders } from './interfaces/IHeaders';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IResponseInternal } from './interfaces/IResponseInternal';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';
import { action, runInAction } from 'mobx';
import { IResponseObject } from './interfaces/IResponseObject';

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

function initData<T extends PureModel>(
  response: IResponseObject,
  collection?: PureCollection,
  overrideData?: T | Array<T>,
): any {
  if (collection && response.data) {
    const data: any = overrideData || collection.add(response.data);

    return new Bucket.ToOneOrMany<T>(data, collection as any, true);
  }

  if (response.data) {
    // The case when a record is not in a store and save/remove are used
    if (response.data) {
      if (response.data instanceof Array) {
        throw new Error('A save/remove operation should not return an array of results');
      }

      return {
        value: new PureModel(response.data), // TODO: Make a Generic model
        // value: overrideData || (new GenericModel(flattenModel(undefined, resp.data)) as T),
      };
    }
  }

  return new Bucket.ToOneOrMany<T>(null, collection as any, true);
}

export class Response<T extends PureModel> {
  private __data;

  private __internal: IResponseInternal = {
    response: {},
    views: [],
  };

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
  public get error(): Array<string | object> | Error | undefined {
    return this.__internal.error;
  }

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
   * @type {PureCollection}
   * @memberOf Response
   */
  public readonly collection?: PureCollection;

  public get isSuccess(): boolean {
    return !this.error;
  }

  public get data(): T | Array<T> | null {
    return this.__data.value;
  }

  constructor(
    response: IResponseObject,
    collection?: PureCollection,
    options?: IRequestOptions,
    overrideData?: T | Array<T>,
    views?: Array<View>,
  ) {
    this.collection = collection;
    runInAction(() => {
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
    });
  }

  private __updateInternal(
    response: IResponseObject,
    options?: IRequestOptions,
    views?: Array<View>,
  ): void {
    if (options) {
      this.__internal.options = options;
    }

    this.__internal.response = response;
    this.__internal.headers = response.headers && initHeaders(response.headers);
    this.__internal.requestHeaders = response.requestHeaders;
    this.__internal.error = response.error;
    this.__internal.status = response.status;

    if (views) {
      this.__internal.views = views;
    }

    if (!this.error && !this.status) {
      this.__internal.error = new Error('Network not available');
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
  @action
  public replaceData(data: T): Response<T> {
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

    updateModel(data, modelToJSON(record));
    updateModelId(data, newId);

    this.views.forEach((view, index) => {
      if (viewIndexes[index] !== -1) {
        view.list[viewIndexes[index]] = data;
      }
    });

    return new Response(this.__internal.response, this.collection, this.__internal.options, data);
  }

  public clone(): Response<T> {
    return new Response(
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

  @action
  public update(response: IResponseObject, views?: Array<View>): Response<T> {
    this.__updateInternal(response, undefined, views);
    const newData = initData(response, this.collection);

    this.__data.__readonlyValue = newData.value;

    return this;
  }
}
