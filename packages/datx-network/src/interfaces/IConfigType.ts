import { CachingStrategy } from '../enums/CachingStrategy';
import { ParamArrayType } from '../enums/ParamArrayType';
import { IResponseObject } from './IResponseObject';
import { BodyType } from '../enums/BodyType';
import { PureCollection } from 'datx';

export interface IConfigType {
  baseUrl: string;
  cache: CachingStrategy;
  maxCacheAge: number;
  defaultFetchOptions: Record<string, any>;
  fetchReference?: typeof fetch;
  paramArrayType: ParamArrayType;
  encodeQueryString: boolean;
  serialize(data: IResponseObject, type: BodyType): IResponseObject;
  parse(data: IResponseObject): IResponseObject;
  collection?: PureCollection;
}
