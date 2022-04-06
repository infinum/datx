import { IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';

export type Operation = 'getOne' | 'getMany' | 'getAll';

export interface IExpressionLike {
  op: Operation;
}

export interface IGetOneExpression {
  op: 'getOne';
  type: IType;
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetManyExpression {
  op: 'getMany';
  type: IType;
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetAllExpression {
  op: 'getAll';
  type: IType;
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
}

export type Expression =
  | IGetOneExpression
  | IGetManyExpression
  | IGetAllExpression;

export type ExpressionArgument =
  Expression
  | null
  | undefined
  | false;

export type QueryExpression =
  | ExpressionArgument
  | (() => ExpressionArgument);
