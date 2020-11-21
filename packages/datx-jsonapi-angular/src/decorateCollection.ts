import { ICollectionConstructor, PureCollection, IModelConstructor, IType, PureModel, getModelType, getModelId } from 'datx';
import { IRequestOptions, clearCacheByType } from 'datx-jsonapi';
import { Observable, empty } from 'rxjs';

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
      return observableWrapper<T, Response<T>>((rxOptions: IRxFetchOptions) => {
        return super.getOne<any>(type, id, Object.assign({}, options, rxOptions));
      });
    }

    public getMany<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, options?: IRequestOptions): Observable<Response<T>> {
      return observableWrapper<T, Response<T>>((rxOptions: IRxFetchOptions) => {
        return super.getMany<any>(type, Object.assign({}, options, rxOptions));
      });
    }

    public request<T extends IJsonapiModel = IJsonapiModel>(url: string, method?: string, data?: object, options?: IRequestOptions): Observable<Response<T>> {
      return observableWrapper<T, Response<T>>((rxOptions: IRxFetchOptions) => {
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
      let remoteOp: boolean | IRequestOptions | undefined;
      let modelId: string;
      let model: IJsonapiModel | null;
      const type = getModelType(obj);

      if (typeof id === 'object' || id === undefined || typeof id === 'boolean') {
        remoteOp = id;
        modelId = getModelId(obj).toString();
        model = obj as IJsonapiModel;
      } else {
        remoteOp = options;
        modelId = getModelId(id).toString();
        model = modelId ? (this.findOne(type, modelId) as IJsonapiModel | null) : null;
      }

      if (model && remoteOp) {
        return model.destroy(remoteOp === true ? undefined : remoteOp);
      }

      if (model) {
        this.__removeModel(model);
      }
      clearCacheByType(type);
      return empty();
    }
  }

  return JsonapiCollection as unknown as ICollectionConstructor<PureCollection & IJsonapiCollection>;
}
