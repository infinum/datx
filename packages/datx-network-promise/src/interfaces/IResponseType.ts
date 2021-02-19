import { PureModel } from '@datx/core';
import { Response } from '../Response';

export type IResponseType<TResponseValue extends TModel | Array<TModel>, TModel = PureModel> = Promise<Response<TResponseValue, TModel>>;
