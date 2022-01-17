import { IType } from '@datx/core';
import { IRequestOptions } from './IRequestOptions';

export interface IResponseSnapshot<
  TModel extends Record<string, unknown> = Record<string, unknown>,
> {
  response: Record<string, unknown> & { headers?: Array<[string, string]> } & {
    data: TModel | Array<TModel>;
  } & { status: number };
  options?: IRequestOptions;
  type?: IType;
}
