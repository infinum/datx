import {IViewConstructor, View} from 'datx';
import {IDictionary, IRawModel, mapItems} from 'datx-utils';

import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {IJsonapiView} from './interfaces/IJsonapiView';
import {IRequestOptions} from './interfaces/IRequestOptions';
import {IResponse} from './interfaces/JsonApi';
import {IDefinition, IRelationship, IRequest} from './interfaces/JsonApi';
import {Response} from './Response';

declare var window: object|undefined;

export function decorateView(BaseClass: typeof View) {

  class JsonapiView extends BaseClass {
    public sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T|Array<T>|null {
      const data = this.__collection.sync(body);
      this.add(data);
      return data;
    }

    /**
     * Fetch the records with the given type and id
     *
     * @param {number|string} type Record id
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public fetch<T extends IJsonapiModel = IJsonapiModel>(
      id: number|string,
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      return this.__collection.fetch(this.modelType, id, options).then(this.__addFromResponse.bind(this));
    }

    /**
     * Fetch the first page of records of the given type
     *
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public fetchAll<T extends IJsonapiModel = IJsonapiModel>(
      options?: IRequestOptions,
    ): Promise<Response<T>> {
      return this.__collection.fetchAll(this.modelType, options).then(this.__addFromResponse.bind(this));
    }

    private __addFromResponse<T extends IJsonapiModel = IJsonapiModel>(response: Response<T>) {
      if (response.data) {
        this.add(response.data);
      }
      response.views.push(this);
      return response;
    }
  }

  return JsonapiView as IViewConstructor<View & IJsonapiView>;
}
