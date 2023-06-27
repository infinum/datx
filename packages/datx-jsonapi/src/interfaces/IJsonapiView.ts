import { View } from '@datx/core';
import type { IResponse } from '@datx/jsonapi-types';

import { Response } from '../Response';
import { IGetAllResponse } from './IGetAllResponse';
import { IJsonapiModel } from './IJsonapiModel';
import { IRequestOptions } from './IRequestOptions';

export interface IJsonapiView<T extends IJsonapiModel = IJsonapiModel> extends View<T> {
  sync(body?: IResponse): T | Array<T> | null;

  getOne(id: string, options?: IRequestOptions): Promise<Response<T>>;
  getMany(options?: IRequestOptions): Promise<Response<T>>;
  getAll(options?: IRequestOptions, maxRequests?: number): Promise<IGetAllResponse<T>>;
}
