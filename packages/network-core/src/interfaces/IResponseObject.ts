import { PureCollection, IType, PureModel } from '@datx/core';
import { IHeaders } from './IHeaders';

interface INativeHeaders {
  get(name: string): string | null;
  forEach(cb: (value: string, key: string) => void): void;
}
interface IAngularHeaders {
  get(name: string): string | null;
  getAll(name: string): Array<string> | null;
  keys(): Array<string>;
}

export type IResponseHeaders = INativeHeaders | IAngularHeaders;

export interface IResponseObject {
  data?: Record<string, unknown> | null;
  error?: Error;
  headers?: INativeHeaders | IAngularHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
}
