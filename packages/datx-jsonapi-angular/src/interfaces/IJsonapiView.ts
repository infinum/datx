import { IRequestOptions, IResponse } from 'datx-jsonapi';
import { View } from 'datx';
import { Observable } from 'rxjs';

import { IJsonapiModel } from './IJsonapiModel';
import { Response } from '../Response';

export interface IJsonapiView<T extends IJsonapiModel = IJsonapiModel> extends View<T> {
  sync(body?: IResponse): T | Array<T> | null;

  getOne(id: string, options?: IRequestOptions): Observable<Response<T>>;
  getMany(options?: IRequestOptions): Observable<Response<T>>;
}
