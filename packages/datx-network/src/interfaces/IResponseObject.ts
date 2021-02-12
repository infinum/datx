import { PureCollection, IType, PureModel } from '@datx/core';
import { IResponseHeaders } from '@datx/utils';

import { IHeaders } from './IHeaders';

export interface IResponseObject {
  data?: Record<string, unknown>;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
}
