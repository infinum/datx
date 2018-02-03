import {getModelId, getModelType, modelToJSON, PureModel, updateModel, updateModelId} from 'datx';
import {action, computed, extendObservable, IComputedValue, isObservableArray} from 'mobx';

import {IDictionary} from './interfaces/IDictionary';
import {IHeaders} from './interfaces/IHeaders';
import {IRawResponse} from './interfaces/IRawResponse';
import {IRequestOptions} from './interfaces/IRequestOptions';
import {IResponseHeaders} from './interfaces/IResponseHeaders';
import {IError, IJsonApiObject, ILink} from './interfaces/JsonApi';

import {flattenModel} from './helpers/model';
import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {fetchLink} from './NetworkUtils';

export class Response {

  /**
   * API response data (synced with the store)
   *
   * @type {(PureModel|Array<PureModel>)}
   * @memberOf Response
   */
  public data: PureModel|Array<PureModel>|null = null;

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
  public first: Promise<Response>; // Handled by the __fetchLink

  /**
   * Previous data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public prev: Promise<Response>; // Handled by the __fetchLink

  /**
   * Next data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public next: Promise<Response>; // Handled by the __fetchLink

  /**
   * Last data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public last: Promise<Response>; // Handled by the __fetchLink

  /**
   * Received HTTP status
   *
   * @type {number}
   * @memberOf Response
   */
  public status?: number;

  /**
   * Related Store
   *
   * @private
   * @type {IJsonapiCollection}
   * @memberOf Response
   */
  private __collection: IJsonapiCollection;

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
  private __cache: IDictionary<Promise<Response>> = {};

  constructor(
    response: IRawResponse,
    collection: IJsonapiCollection,
    options?: IRequestOptions,
    overrideData?: PureModel|Array<PureModel>,
  ) {
    this.__collection = collection;
    this.__options = options;
    this.__response = response;
    this.status = response.status;

    if (collection) {
      this.data = overrideData ? collection.add(overrideData) : collection.sync(response.data);
    } else if (response.data) {
      // The case when a record is not in a store and save/remove are used
      const resp = response.data;

      if (resp.data instanceof Array) {
        throw new Error('A save/remove operation should not return an array of results');
      }

      this.data = overrideData || new PureModel(flattenModel(resp.data));
    }

    this.meta = (response.data && response.data.meta) || {};
    this.links = (response.data && response.data.links) || {};
    this.jsonapi = (response.data && response.data.jsonapi) || {};
    this.headers = response.headers;
    this.requestHeaders = response.requestHeaders;
    this.error = (response.data && response.data.errors) || response.error;

    const linkGetter: IDictionary<IComputedValue<Promise<Response>>> = {};
    if (this.links) {
      Object.keys(this.links).forEach((link: string) => {
        linkGetter[link] = computed(() => this.__fetchLink(link));
      });
    }

    extendObservable(this, linkGetter);

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
  @action public replaceData(data: PureModel): Response {
    const record: PureModel = this.data as PureModel;
    if (record === data) {
      return this;
    }

    const oldId = getModelId(data);
    const newId = getModelId(record);
    const type = getModelType(record);

    if (this.__collection) {
      this.__collection.remove(record);
    }

    updateModel(data, modelToJSON(record));
    updateModelId(data, newId);

    return new Response(this.__response, this.__collection, this.__options, data);
  }

  /**
   * Update references in the store
   *
   * @private
   * @param {any} type Record type
   * @param {any} oldId Old redord ID
   * @param {any} newId New record ID
   * @memberof Response
   */
  private __updateStoreReferences(type, oldId, newId) {
    if (this.__collection) {
      const modelHash = this.__collection['__modelHash'][type];
      const oldModel = modelHash[oldId];
      modelHash[newId] = oldModel;
      delete modelHash[oldId];

      this.__updateReferences(oldId, newId);
    }
  }

  /**
   * Update models that reference the updated model
   *
   * @private
   * @param {any} oldId Old record ID
   * @param {any} newId new record ID
   * @memberof Response
   */
  private __updateReferences(oldId, newId) {
    this.__collection['__data'].map((model) => {
      const keyList = Object.keys(model['__data']);
      keyList.map((key) => {
        const keyId = `${key}Id`;
        if (key in model && keyId in model) {
          if (isObservableArray(model[keyId])) {
            const index = model[keyId].indexOf(oldId);
            if (index > -1) {
              model[keyId][index] = newId;
            }
          } else if (model[keyId] === oldId) {
            model[keyId] = newId;
          }
        }
      });
    });
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
  private __fetchLink(name) {
    if (!this.__cache[name]) {

      const link: ILink|null = (this.links && name in this.links) ? this.links[name] : null;

      if (link) {
        this.__cache[name] = fetchLink(link, this.__collection, this.requestHeaders, this.__options);
      }
    }
    return this.__cache[name];
  }
}
