import { PureModel } from '@datx/core';
import { Response as BaseResponse } from '@datx/network';

export class Response<TResponseData extends TModel | Array<TModel>, TModel extends PureModel = PureModel> extends BaseResponse<TResponseData, TModel> {
  // Nothing to do here for now?
}