import { View, PureCollection } from '@datx/core';
import { Response as BaseResponse, IResponseObject } from '@datx/network';
import { assignComputed } from '@datx/utils';
import { IJsonApiObject, ILink } from '@datx/jsonapi-types';

import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IResponseInternal } from './interfaces/IResponseInternal';

import { fetchLink } from './NetworkUtils';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';

export class NetworkResponse<T extends IJsonapiModel> extends BaseResponse<T> {
  /**
   * API response metadata
   *
   * @type {object}
   * @memberOf Response
   */
  public get meta(): object | undefined {
    return (this.__internal as IResponseInternal).meta;
  }

  /**
   * API response links
   *
   * @type {object}
   * @memberOf Response
   */
  public get links(): Record<string, ILink> | undefined {
    return (this.__internal as IResponseInternal).links;
  }

  /**
   * The JSON API object returned by the server
   *
   * @type {JsonApi.IJsonApiObject}
   * @memberOf Response
   */
  public get jsonapi(): IJsonApiObject | undefined {
    return (this.__internal as IResponseInternal).jsonapi;
  }

  /**
   * First data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public first?: () => Promise<NetworkResponse<T>>; // Handled by the __fetchLink

  /**
   * Previous data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public prev?: () => Promise<NetworkResponse<T>>; // Handled by the __fetchLink

  /**
   * Next data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public next?: () => Promise<NetworkResponse<T>>; // Handled by the __fetchLink

  /**
   * Last data page
   *
   * @type {Promise<Response>}
   * @memberOf Response
   */
  public last?: () => Promise<NetworkResponse<T>>; // Handled by the __fetchLink

  public get views(): Array<View> {
    return this.__internal.views;
  }

  constructor(
    response: IResponseObject,
    collection?: PureCollection,
    overrideData?: T,
    views?: Array<View>,
  ) {
    super(response, collection, overrideData, views);

    if (this.links) {
      Object.keys(this.links).forEach((link: string) => {
        assignComputed(this, link, () => this.__fetchLink(link));
      });
    }
  }

  /**
   * Function called when a link is being fetched. The returned value is cached
   *
   * @private
   * @param {string} name Link name
   * @returns Promise that resolves with a Response object
   *
   * @memberOf NetworkResponse
   */
  private __fetchLink(name: string): () => Promise<NetworkResponse<T>> {
    if (!this.__cache[name]) {
      const link: ILink | null = this.links && name in this.links ? this.links[name] : null;

      if (link) {
        const options = Object.assign({}, this.__internal.options);

        options.networkConfig = options.networkConfig || {};
        options.networkConfig.headers = this.requestHeaders;
        this.__cache[name] = (): Promise<NetworkResponse<T>> =>
          fetchLink<T>(link, this.collection as IJsonapiCollection, options, this.views).then(
            (response) =>
              new NetworkResponse<T>(
                response['__internal'].response,
                response.collection,
                undefined,
                response.views,
              ),
          );
      }
    }

    return this.__cache[name] as () => Promise<NetworkResponse<T>>;
  }
}
