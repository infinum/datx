import { PureModel } from '@datx/core';
import { NetworkResponse } from '../NetworkResponse';

export interface IGetAllResponse<T extends PureModel = PureModel> {
  data: Array<T>;
  responses: Array<NetworkResponse<T>>;
  lastResponse: NetworkResponse<T>;
}
