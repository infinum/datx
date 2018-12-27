import {View} from 'datx';

import {Response} from '../Response';
import {IJsonapiModel} from './IJsonapiModel';
import {IRequestOptions} from './IRequestOptions';
import {IResponse} from './JsonApi';

export interface IJsonapiView extends View {
  latestResponse?: Response<IJsonapiModel>;

  sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T | Array<T> | null;

  fetch<T extends IJsonapiModel = IJsonapiModel>(
    id: number | string,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  fetchAll<T extends IJsonapiModel = IJsonapiModel>(
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  fetchPage<T extends IJsonapiModel = IJsonapiModel>(
    pageNumber?: number,
    pageSize?: number,
    options?: IRequestOptions,
  ): Promise<Response<T>>;
}
