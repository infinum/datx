import { IViewConstructor } from 'datx';
import { IRequestOptions } from 'datx-jsonapi';
import { Observable } from 'rxjs';

import { IJsonapiView } from './interfaces/IJsonapiView';
import { IRxFetchOptions } from './interfaces/IRxFetchOptions';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { observableWrapper } from './helpers/wrapper';
import { Response } from './Response';

export function decorateView<U>(
  BaseClass: IViewConstructor<IJsonapiModel, IJsonapiView>,
): IViewConstructor<IJsonapiModel, U & IJsonapiView> {
  class JsonapiView<M extends IJsonapiModel = IJsonapiModel>  extends BaseClass {
    public getOne(id: string, options?: IRequestOptions): Observable<Response<M>> {
      return observableWrapper<M>((rxOptions: IRxFetchOptions) => {
        return super.getOne(id, Object.assign({}, options, rxOptions));
      });
    }

    public getMany(options?: IRequestOptions): Observable<Response<M>> {
      return observableWrapper<M>((rxOptions: IRxFetchOptions) => {
        return super.getMany(Object.assign({}, options, rxOptions));
      });
    }
  }

  return JsonapiView as unknown as IViewConstructor<IJsonapiModel, U & IJsonapiView>;
}
