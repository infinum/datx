import { IModelConstructor, IType, IViewConstructor, PureCollection, PureModel, View } from '@datx/core';

import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IJsonapiView } from './interfaces/IJsonapiView';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IResponse } from './interfaces/JsonApi';
import { Response } from './Response';

export function decorateView<U>(
  BaseClass: typeof View,
): IViewConstructor<IJsonapiModel, U & IJsonapiView> {
  class JsonapiView<M extends IJsonapiModel = IJsonapiModel> extends BaseClass {
    protected __collection: IJsonapiCollection & PureCollection;

    constructor(
      modelType: IModelConstructor<M> | IType,
      collection: IJsonapiCollection & PureCollection,
      sortMethod?: string | ((item: M) => any),
      models: Array<string | PureModel> = [],
      unique = false,
    ) {
      super(modelType, collection, sortMethod, models, unique);
      this.__collection = collection;
    }

    public sync(body?: IResponse): M | Array<M> | null {
      const data = this.__collection.sync(body);

      if (data) {
        this.add(data);
      }

      return data as M | Array<M> | null;
    }

    /**
     * Fetch the records with the given type and id
     *
     * @param {string} type Record id
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public getOne(id: string, options?: IRequestOptions): Promise<Response<M>> {
      return this.__collection
        .getOne(this.modelType, id, options)
        .then(this.__addFromResponse.bind(this));
    }

    /**
     * Fetch the first page of records of the given type
     *
     * @param {IRequestOptions} [options] Server options
     * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
     */
    public getMany(options?: IRequestOptions): Promise<Response<M>> {
      return this.__collection
        .getMany(this.modelType, options)
        .then(this.__addFromResponse.bind(this));
    }

    protected __addFromResponse(response: Response<M>): Response<M> {
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
