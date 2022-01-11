import { View, PureCollection, IType, PureModel } from '@datx/core';

import { HttpMethod } from '../enums/HttpMethod';

export interface IFetchOptions {
  url: string;
  params?: { [param: string]: string | number | boolean | Array<string | number | boolean> };
  headers: { [header: string]: string | Array<string> };
  data?: string | Record<string, unknown> | FormData;
  method: HttpMethod;
  collection?: PureCollection;
  views?: Array<View>;
  type?: IType | typeof PureModel;
}
