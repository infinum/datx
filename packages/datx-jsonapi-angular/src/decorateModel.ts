import { IModelConstructor, PureModel } from 'datx';
import { IRequestOptions } from 'datx-jsonapi';
import { Observable } from 'rxjs';

import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { observableWrapper } from './helpers/wrapper';
import { IRxFetchOptions } from './interfaces/IRxFetchOptions';

export function decorateModel(
  BaseClass: IModelConstructor<PureModel & IJsonapiModel>,
): IModelConstructor<PureModel & IJsonapiModel> {
  class JsonapiModel extends BaseClass {
    public save(options?: IRequestOptions): Observable<IJsonapiModel> {
      return observableWrapper<IJsonapiModel, IJsonapiModel>((rxOptions: IRxFetchOptions) => {
        return super.save(Object.assign({}, options, rxOptions));
      });
    }
  
    public destroy(options?: IRequestOptions): Observable<void> {
      return observableWrapper<any, void>((rxOptions: IRxFetchOptions) => {
        return super.save(Object.assign({}, options, rxOptions)) as any;
      });
    }
  }

  return JsonapiModel as unknown as IModelConstructor<PureModel & IJsonapiModel>;
}
