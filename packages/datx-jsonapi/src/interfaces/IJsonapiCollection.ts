import { IModelConstructor, IType, PureCollection, PureModel } from '@datx/core';
import { IResponseData } from '..';

import { Response } from '../Response';
import { IGetAllResponse } from './IGetAllResponse';
import { IJsonapiModel } from './IJsonapiModel';
import { IRequestOptions } from './IRequestOptions';
import { IResponse } from './JsonApi';

export interface IJsonapiCollection extends PureCollection {
  sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T | Array<T> | null;

  /**
   * Fetch the records with the given type and id
   *
   * @param {string} type Record type
   * @param {string} type Record id
   * @param {IRequestOptions} [options] Server options
   * @returns {Promise<Response>} Resolves with the Response object or rejects with an error
   */
  fetch<T extends IJsonapiModel = IJsonapiModel>(
    type: IType | IModelConstructor<T>,
    id: string,
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
    type: IType | IModelConstructor<T>,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  getOne<T extends IJsonapiModel = IJsonapiModel>(
    type: IType | IModelConstructor<T>,
    id: string,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  getMany<T extends IJsonapiModel = IJsonapiModel>(
    type: IType | IModelConstructor<T>,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  getAll<T extends IJsonapiModel = IJsonapiModel>(
    type: IType | IModelConstructor<T>,
    options?: IRequestOptions,
    maxRequests?: number,
  ): Promise<IGetAllResponse<T>>;

  request<TModel extends IJsonapiModel = IJsonapiModel, IData extends IResponseData = IResponseData<TModel>>(
    url: string,
    method?: string,
    data?: object,
    options?: IRequestOptions,
  ): Promise<Response<TModel, IData>>;

  removeOne(
    type: IType | typeof PureModel,
    id: string,
    options?: boolean | IRequestOptions,
  ): Promise<void>;
  removeOne(model: PureModel, options?: boolean | IRequestOptions): Promise<void>;
}
