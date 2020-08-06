import { PureCollection, IType, PureModel, IModelConstructor } from 'datx';

import { IRequestOptions } from './IRequestOptions';
import { Response } from '../Response';
import { INetworkModel } from './INetworkModel';

export interface INetworkCollection extends PureCollection {
  getOne<T extends INetworkModel = INetworkModel>(
    type: IType | IModelConstructor<T>,
    id: string,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  getMany<T extends INetworkModel = INetworkModel>(
    type: IType | IModelConstructor<T>,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  request<T extends INetworkModel = INetworkModel>(
    url: string,
    method?: string,
    data?: object,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  removeOne(
    type: IType | typeof PureModel,
    id: string,
    options?: boolean | IRequestOptions,
  ): Promise<void>;
  removeOne(model: PureModel, options?: boolean | IRequestOptions): Promise<void>;
}
