import {IIdentifier, IModelConstructor, IType, IViewConstructor, PureModel, View} from 'datx';
import {IDictionary, IRawModel, mapItems} from 'datx-utils';

import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {IJsonapiView} from './interfaces/IJsonapiView';
import {IRequestOptions} from './interfaces/IRequestOptions';
import {IResponse} from './interfaces/JsonApi';
import {IDefinition, IRelationship, IRequest} from './interfaces/JsonApi';
import {Response} from './Response';

declare var window: object|undefined;

export function decorateView<U>(BaseClass: typeof View) {

  class JsonapiView<M extends IJsonapiModel = IJsonapiModel> extends BaseClass {
    protected __collection: IJsonapiCollection;

    constructor(
      modelType: IModelConstructor<M>|IType,
      collection: IJsonapiCollection,
      sortMethod?: string|((item: M) => any),
      models: Array<IIdentifier|PureModel> = [],
      unique: boolean = false,
    ) {
      super(modelType, collection, sortMethod, models, unique);
      this.__collection = collection;
    }

    public sync(body?: IResponse): M|Array<M>|null {
      const data = this.__collection.sync(body);
      if (data) {
        this.add(data);
      }
      return data as M|Array<M>|null;
    }

    /**
     * Fetch the records with the given type and id
     *
     * @param {number|string} type Record id
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public fetch(
      id: number|string,
      options?: IRequestOptions,
    ): Promise<Response<M>> {
      return this.__collection
        .fetch(this.modelType, id, options)
        .then(this.__addFromResponse.bind(this)) as Promise<Response<M>>;
    }

    /**
     * Fetch the first page of records of the given type
     *
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public fetchAll(
      options?: IRequestOptions,
    ): Promise<Response<M>> {
      return this.__collection
        .fetchAll(this.modelType, options)
        .then(this.__addFromResponse.bind(this)) as Promise<Response<M>>;
    }

    private __addFromResponse(response: Response<M>) {
      if (response.data) {
        this.add(response.data);
      }
      response.views.push(this);
      return response;
    }
  }

  // @ts-ignore
  return JsonapiView as IViewConstructor<IJsonapiModel, U & IJsonapiView>;
}
