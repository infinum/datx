import { PureCollection, IType, PureModel, View } from '@datx/core';

import { ParamArrayType } from '../enums/ParamArrayType';
import { IFetchOptions } from './IFetchOptions';
import { IResponseObject } from './IResponseObject';
import { fetchInterceptor } from '../interceptors/fetch';
import { Response } from '../Response';

export interface IConfigType {
  baseUrl: string;
  paramArrayType: ParamArrayType;
  encodeQueryString: boolean;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
  views?: Array<View>;
  fetchReference?: typeof fetch;
  serialize?: (options: IFetchOptions) => IFetchOptions;
  parse?: (data: object, options: IResponseObject) => object;
  fetchInterceptor: typeof fetchInterceptor;
  Response: typeof Response;
}
