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
import { IResponseInternal } from './interfaces/IResponseInternal';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';
import { action, runInAction } from 'mobx';
import { IResponseObject } from './interfaces/IResponseObject';
import { mapItems } from 'datx-utils';

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

function initData<T extends PureModel | Array<PureModel>>(
  response: IResponseObject,
  collection?: PureCollection,
  overrideData?: T,
): any {
  let data: any = null;
  if (collection && response.data) {
    data =
      overrideData ||
      (response.type
        ? collection.add(response.data, response.type)
        : collection.add(response.data));
  } else if (response.data) {
    const ModelConstructor =
      response.type === PureModel || Object.isPrototypeOf.call(PureModel, response.type || {})
        ? (response.type as typeof PureModel)
        : PureModel;

    data = overrideData || mapItems(response.data, (item) => new ModelConstructor(item));
    return { value: data };
  }

  return new Bucket.ToOneOrMany<T>(data, collection as any, true);
}

export class Response<T extends PureModel | Array<PureModel>> {
  protected __data;

  protected __internal: IResponseInternal = {
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

  /**
   * Cache used for the link requests
   *
   * @protected
   * @type {Record<string, Promise<Response>>}
   * @memberOf Response
   */
  protected readonly __cache: Record<string, () => Promise<Response<T>>> = {};

  public get isSuccess(): boolean {
    return !this.error;
  }

  public get data(): T | null {
    return this.__data.value;
  }

  constructor(
    response: IResponseObject,
    collection?: PureCollection,
    overrideData?: T,
    views?: Array<View>,
  ) {
    this.collection = collection;
    runInAction(() => {
      this.__updateInternal(response, views);
      try {
        this.__data = initData(response, collection, overrideData);
      } catch (e) {
        this.__internal.error = e;
      }

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

  private __updateInternal(response: IResponseObject, views?: Array<View>): void {
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

    return new Response(this.__internal.response, this.collection, data);
  }

  public clone(): Response<T> {
    return new Response(this.__internal.response, this.collection, this.data || undefined);
  }

  public get snapshot(): IResponseSnapshot {
    return {
      response: Object.assign({}, this.__internal.response, {
        headers:
          this.__internal.response.headers && serializeHeaders(this.__internal.response.headers),
        collection: undefined,
      }),
    };
  }

  @action
  public update(response: IResponseObject | Response<T>, views?: Array<View>): Response<T> {
    const responseData = response instanceof Response ? response.__internal.response : response;
    this.__updateInternal(responseData, views);
    const newData = initData(responseData, this.collection);

    this.__data.__readonlyValue = newData.value;

    return this;
  }
}
