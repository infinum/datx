import { PureModel, PureCollection, IType } from '@datx/core';

import { IRequestOptions } from './IRequestOptions';
import { Response } from '../Response';
import { INetworkModel } from './INetworkModel';
import { INetworkModelConstructor } from './INetworkModelConstructor';

export interface INetworkCollection extends PureCollection {
  getOne<T extends INetworkModel = INetworkModel>(
    type: IType | INetworkModelConstructor,
    id: string,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  getMany<T extends INetworkModel = INetworkModel>(
    type: IType | INetworkModelConstructor,
    options?: IRequestOptions,
  ): Promise<Response<T>>;

  removeOne(
    type: IType | typeof PureModel,
    id: string,
    options?: boolean | IRequestOptions,
  ): Promise<void>;
  removeOne(model: INetworkModel, options?: boolean | IRequestOptions): Promise<void>;
}
