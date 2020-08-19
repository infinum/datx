import { PureCollection, IType, PureModel, View } from 'datx';

import { ParamArrayType } from '../enums/ParamArrayType';
import { IFetchOptions } from './IFetchOptions';
import { IResponseObject } from './IResponseObject';

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
}
