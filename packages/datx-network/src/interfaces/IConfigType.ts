import { CachingStrategy } from '../enums/CachingStrategy';
import { ParamArrayType } from '../enums/ParamArrayType';
import { IResponseObject } from './IResponseObject';
import { BodyType } from '../enums/BodyType';
import { PureCollection, IType, PureModel, View } from 'datx';

export interface IConfigType {
  baseUrl: string;
  cache: CachingStrategy;
  maxCacheAge: number;
  fetchReference?: typeof fetch;
  paramArrayType: ParamArrayType;
  encodeQueryString: boolean;
  serialize(data: any, type: BodyType): any;
  parse(data: IResponseObject): IResponseObject;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
  views?: Array<View>;
}
