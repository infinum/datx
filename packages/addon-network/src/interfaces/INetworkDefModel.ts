import { IModelConstructor, PureModel } from '@datx/core';
import { BaseRequest } from '../BaseRequest';

export interface ICrud<TResponseType> {
  create?: BaseRequest<TResponseType>,
  update?: BaseRequest<TResponseType>,
  patch?: BaseRequest<TResponseType>,
  read?: BaseRequest<TResponseType>,
  delete?: BaseRequest<TResponseType>,
}

export interface INetworkDefModel<TResponseType> extends IModelConstructor<PureModel> {
  network: {
    one: ICrud<TResponseType>;
    many: ICrud<TResponseType>;
  };
}
