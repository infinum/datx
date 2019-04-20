import { View } from 'datx';

import { Response } from '../Response';
import { IJsonapiModel } from './IJsonapiModel';
import { IRequestOptions } from './IRequestOptions';
import { IResponse } from './JsonApi';

export interface IJsonapiView<T extends IJsonapiModel = IJsonapiModel> extends View<T> {
  sync(body?: IResponse): T | Array<T> | null;

  fetch(id: string, options?: IRequestOptions): Promise<Response<T>>;
  fetchAll(options?: IRequestOptions): Promise<Response<T>>;
}
