import { IRequestOptions, IResponse } from 'datx-jsonapi';
import { IType, PureModel, IModelConstructor, PureCollection } from 'datx';
import { Observable } from 'rxjs';

import { IJsonapiModel } from './IJsonapiModel';
import { Response } from '../Response';

export interface IJsonapiCollection extends PureCollection {
  sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T | Array<T> | null;
  getOne<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, id: string, options?: IRequestOptions): Observable<Response<T>>;
  getMany<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, options?: IRequestOptions): Observable<Response<T>>;
  request<T extends IJsonapiModel = IJsonapiModel>(url: string, method?: string, data?: object, options?: IRequestOptions): Observable<Response<T>>;
  removeOne(type: IType | typeof PureModel, id: string, options?: boolean | IRequestOptions): Observable<void>;
  removeOne(model: PureModel, options?: boolean | IRequestOptions): Observable<void>;
}
