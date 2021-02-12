import { IViewConstructor, PureCollection } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';
import { Observable } from 'rxjs';

import { IJsonapiView } from './interfaces/IJsonapiView';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Response } from './Response';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { map } from 'rxjs/operators';

export function decorateView<U>(
  BaseClass: IViewConstructor<IJsonapiModel, IJsonapiView>,
): IViewConstructor<IJsonapiModel, U & IJsonapiView> {
  class JsonapiView<M extends IJsonapiModel = IJsonapiModel>  extends BaseClass {
    protected __collection!: IJsonapiCollection & PureCollection;

    /**
     * Fetch the records with the given type and id
     *
     * @param {string} type Record id
     * @param {IRequestOptions} [options] Server options
     * @returns {Observable<Response>} Resolves with the Response object or rejects with an error
     */
    public getOne(id: string, options?: IRequestOptions): Observable<Response<M>> {
      return this.__collection
        .getOne(this.modelType, id, options)
        .pipe(map(this['__addFromResponse'].bind(this)));
    }

    /**
     * Fetch the first page of records of the given type
     *
     * @param {IRequestOptions} [options] Server options
     * @returns {Observable<Response>} Resolves with the Response object or rejects with an error
     */
    public getMany(options?: IRequestOptions): Observable<Response<M>> {
      return this.__collection
        .getMany(this.modelType, options)
        .pipe(map(this['__addFromResponse'].bind(this)));
    }
  }

  return JsonapiView as unknown as IViewConstructor<IJsonapiModel, U & IJsonapiView>;
}
