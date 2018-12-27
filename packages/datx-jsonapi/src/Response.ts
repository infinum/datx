import {getModelId, getModelType, modelToJSON, PureModel, updateModel, updateModelId, View} from 'datx';
import {assignComputed, IDictionary} from 'datx-utils';
import {action, computed, IComputedValue, isObservableArray} from 'mobx';

import {IHeaders} from './interfaces/IHeaders';
import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {IJsonapiView} from './interfaces/IJsonapiView';
import {IPageInfo} from './interfaces/IPageInfo';
import {IRawResponse} from './interfaces/IRawResponse';
import {IRequestOptions} from './interfaces/IRequestOptions';
import {IResponseHeaders} from './interfaces/IResponseHeaders';
import {IError, IJsonApiObject, ILink} from './interfaces/JsonApi';

import {GenericModel} from './GenericModel';
import {flattenModel} from './helpers/model';
import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {config, fetchLink} from './NetworkUtils';

export class Response<T extends IJsonapiModel> {
  /**
   * API response data (synced with the store)
   *
   * @type {(PureModel|Array<PureModel>)}
   * @memberOf Response
   */
  public data: T|Array<T>|null = null;

  /**
   * API response metadata
   *
   * @type {object}
   * @memberOf Response
   */
  public meta?: object;

  /**
   * API response links
   *
   * @type {object}
   * @memberOf Response
   */
  public links?: IDictionary<ILink>;

  /**
   * The JSON API object returned by the server
   *
   * @type {JsonApi.IJsonApiObject}
   * @memberOf Response
   */
  public jsonapi?: IJsonApiObject;

  /**
   * Headers received from the API call
   *
   * @type {IResponseHeaders}
   * @memberOf Response
   */
  public headers?: IResponseHeaders;

  /**
   * Headers sent to the server
   *
   * @type {IHeaders}
   * @memberOf Response
   */
  public requestHeaders?: IHeaders;

  /**
   * Request error
   *
   * @type {(Array<JsonApi.IError>|Error)}
   * @memberOf Response
   */
  public error?: Array<IError>|Error;

  /**
   * First data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public first?: Promise<Response<T>>; // Handled by the __fetchLink

  /**
   * Previous data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public prev?: Promise<Response<T>>; // Handled by the __fetchLink

  /**
   * Next data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public next?: Promise<Response<T>>; // Handled by the __fetchLink

  /**
   * Last data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public last?: Promise<Response<T>>; // Handled by the __fetchLink

  /**
   * Received HTTP status
   *
   * @type {number}
   * @memberOf Response
   */
  public status?: number;

  public view?: View;

  /**
   * Related Store
   *
   * @private
   * @type {IJsonapiCollection}
   * @memberOf Response
   */
  private __collection?: IJsonapiCollection;

  /**
   * Server options
   *
   * @private
   * @type {IRequestOptions}
   * @memberOf Response
   */
  private __options?: IRequestOptions;

  /**
   * Original server response
   *
   * @private
   * @type {IRawResponse}
   * @memberOf Response
   */
  private __response: IRawResponse;

  /**
   * Cache used for the link requests
   *
   * @private
   * @type {IDictionary<Promise<Response>>}
   * @memberOf Response
   */
  private __cache: IDictionary<Promise<Response<T>>> = {};

  constructor(
    response: IRawResponse,
    collection?: IJsonapiCollection,
    options?: IRequestOptions,
    overrideData?: T|Array<T>,
    view?: View,
  ) {
    this.__collection = collection;
    this.__options = options;
    this.__response = response;
    this.status = response.status;
    if (view) {
      this.view = view;
    }

    if (collection) {
      this.data = overrideData ? collection.add<T>(overrideData as T) : collection.sync<T>(response.data);
    } else if (response.data) {
      // The case when a record is not in a store and save/remove are used
      const resp = response.data;

      if (resp.data) {
        if (resp.data instanceof Array) {
          throw new Error('A save/remove operation should not return an array of results');
        }

        this.data = overrideData || new GenericModel(flattenModel(undefined, resp.data)) as T;
      }
    }

    if (this.view && this.data) {
      (this.view as IJsonapiView).latestResponse = this;
      this.view.add(this.data);
    }

    this.meta = (response.data && response.data.meta) || {};
    this.links = (response.data && response.data.links) || {};
    this.jsonapi = (response.data && response.data.jsonapi) || {};
    this.headers = response.headers;
    this.requestHeaders = response.requestHeaders;
    this.error = (response.data && response.data.errors) || response.error;

    const linkGetter: IDictionary<IComputedValue<Promise<Response<T>>>> = {};
    if (this.links) {
      Object.keys(this.links).forEach((link: string) => {
        assignComputed(this, link, () => this.__fetchLink(link));
      });

      if (this.pageInfo) {
        ['first', 'last', 'prev', 'next'].forEach((link: string) => {
          if (!(link in this)) {
            assignComputed(this, link, () => this.__fetchLink(link));
          }
        });
      }
    }

    Object.freeze(this);

    if (this.error) {
      throw this;
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
  @action public replaceData(data: T): Response<T> {
    const record: PureModel = this.data as PureModel;
    if (record === data) {
      return this;
    }

    const oldId = getModelId(data);
    const newId = getModelId(record);
    const type = getModelType(record);

    const viewIndex = this.view ? this.view.list.indexOf(record) : -1;

    if (this.__collection) {
      this.__collection.remove(type, newId);
      this.__collection.add(data);
    }

    updateModel(data, modelToJSON(record));
    updateModelId(data, newId);

    if (this.view && viewIndex !== -1) {
      this.view.list[viewIndex] = data;
    }

    return new Response(this.__response, this.__collection, this.__options, data, this.view);
  }

  @computed public get pageInfo(): IPageInfo | null {
    return config.pageInfoParser ? config.pageInfoParser(this) : null;
  }

  /**
   * Function called when a link is being fetched. The returned value is cached
   *
   * @private
   * @param {any} name Link name
   * @returns Promise that resolves with a Response object
   *
   * @memberOf Response
   */
  private __fetchLink(name: string): Promise<Response<T>> {
    if (!this.__cache[name]) {
      const link: ILink|null = (this.links && name in this.links) ? this.links[name] : null;

      if (link) {
        this.__cache[name] = fetchLink<T>(
          link, this.__collection, this.requestHeaders, this.__options, this.view,
        );
      } else if (((this.view && 'fetchPage' in this.view) || this.__collection) && this.pageInfo) {
        if ((this.data instanceof Array || isObservableArray(this.data)) && this.data.length) {
          const type = getModelType(this.data[0]);
          const info = this.pageInfo;
          if (info.currentPage === undefined || info.totalPages === undefined) {
            throw new Error('Not enough info in `pageInfo`');
          }
          let getPage = info.currentPage;
          if (name === 'first') {
            getPage = 1;
          } else if (name === 'last') {
            getPage = info.totalPages;
          } else if (name === 'prev') {
            getPage--;
            if (getPage < 1) {
              return fetchLink();
            }
          } else if (name === 'next') {
            getPage++;
            if (getPage > info.totalPages) {
              return fetchLink();
            }
          }
          if (this.view && 'fetchPage' in this.view) {
            this.__cache[name] = (this.view as IJsonapiView).fetchPage(getPage, info.pageSize, this.__options);
          } else if (this.__collection) {
            this.__cache[name] = this.__collection.fetchPage(type, getPage, info.pageSize, this.__options);
          }
        } else {
          throw new Error('Can\'t determine the response type');
        }
      }
    }

    return this.__cache[name];
  }
}
