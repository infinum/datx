import {IIdentifier, IModelConstructor, IType, PureCollection, PureModel} from 'datx';

import {Response} from '../Response';
import {IJsonapiModel} from './IJsonapiModel';
import {IRequestOptions} from './IRequestOptions';
import {IResponse} from './JsonApi';

export interface IJsonapiCollection extends PureCollection {
  sync(body?: IResponse): PureModel|Array<PureModel>|null;

  /**
   * Fetch the records with the given type and id
   *
   * @param {string} type Record type
   * @param {number|string} type Record id
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
   */
  fetch<T extends IJsonapiModel = IJsonapiModel>(
    type: IType|IModelConstructor<T>,
    id: number|string,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  /**
   * Fetch the first page of records of the given type
   *
   * @param {string} type Record type
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
   */
  fetchAll<T extends IJsonapiModel = IJsonapiModel>(
    type: IType|IModelConstructor<T>,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  request<T extends IJsonapiModel = IJsonapiModel>(
    url: string,
    method?: string,
    data?: object,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  remove(type: IType|typeof PureModel, id?: IIdentifier, remote?: boolean|IRequestOptions);
  remove(model: PureModel, remote?: boolean|IRequestOptions);
}
