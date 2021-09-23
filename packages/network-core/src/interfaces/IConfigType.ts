import { PureCollection, IType, PureModel, View } from '@datx/core';

import { ParamArrayType } from '../enums/ParamArrayType';
import { IFetchOptions } from './IFetchOptions';
import { IFinalInterceptor } from './IFinalInterceptor';
import { IResponseObject } from './IResponseObject';
import { Response } from '../Response';
import { IAsync } from './IAsync';
import { Network } from '../Network';

export interface IConfigType {
  baseUrl: string;
  paramArrayType: ParamArrayType;
  encodeQueryString: boolean;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
  views?: Array<View>;
  fetchReference?: typeof fetch;
  serialize?: (options: IFetchOptions) => IFetchOptions;
  parse?: (data: Record<string, unknown>, options: IResponseObject) => Record<string, unknown>;
  fetchInterceptor?: IFinalInterceptor;
  Response: typeof Response;
  network: Network<IAsync<any>>;
}
