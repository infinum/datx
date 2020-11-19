import { ICollectionConstructor, PureCollection, IModelConstructor, IType, PureModel } from 'datx';
import { IRequestOptions } from 'datx-jsonapi';
import { Observable } from 'rxjs';

import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { Response } from './Response';
import { observableWrapper } from './helpers/wrapper';
import { IRxFetchOptions } from './interfaces/IRxFetchOptions';

export function decorateCollection(
  BaseClass: ICollectionConstructor<PureCollection & IJsonapiCollection>,
): ICollectionConstructor<PureCollection & IJsonapiCollection> {
  class JsonapiCollection extends BaseClass {
    public getOne<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, id: string, options?: IRequestOptions): Observable<Response<T>> {
      return observableWrapper<T>((rxOptions: IRxFetchOptions) => {
        return super.getOne<any>(type, id, Object.assign({}, options, rxOptions));
      });
    }

    public getMany<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, options?: IRequestOptions): Observable<Response<T>> {
      return observableWrapper<T>((rxOptions: IRxFetchOptions) => {
        return super.getMany<any>(type, Object.assign({}, options, rxOptions));
      });
    }

    public request<T extends IJsonapiModel = IJsonapiModel>(url: string, method?: string, data?: object, options?: IRequestOptions): Observable<Response<T>> {
      return observableWrapper<T>((rxOptions: IRxFetchOptions) => {
        return super.request<any>(url, method, data, Object.assign({}, options, rxOptions));
      });
    }

    public removeOne(model: PureModel, options?: boolean | IRequestOptions): Observable<void>;
    public removeOne(type: IType | typeof PureModel, id: string, options?: boolean | IRequestOptions): Observable<void>;
    public removeOne(
      obj: IType | typeof PureModel | PureModel,
      id?: string | boolean | IRequestOptions,
      options?: boolean | IRequestOptions,
    ): Observable<void> {
      return observableWrapper<IJsonapiModel, void>((rxOptions: IRxFetchOptions) => {
        return super.removeOne(obj as IType | typeof PureModel, id as string, Object.assign({}, options, rxOptions));
      });
    }
  }

  return JsonapiCollection as unknown as ICollectionConstructor<PureCollection & IJsonapiCollection>;
}
