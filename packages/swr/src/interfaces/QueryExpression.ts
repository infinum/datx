import { IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';

export type Operation = 'getOne' | 'getMany' | 'getAll';

export interface IExpressionLike {
  op: Operation;
}

export interface IGetOneExpression {
  op: 'getOne',
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

export type DeferredLike = null | undefined | false;

export type ExpressionArgument =
  | IGetOneExpression
  | IGetManyExpression
  | IGetAllExpression
  | DeferredLike;

export type Expression =
  | ExpressionArgument
  | (() => ExpressionArgument);

export type RemoveDeferredLike<TType> = TType extends DeferredLike ? never : TType;

export type ExtractDataType<TExpression> = TExpression extends () => infer R
  ? RemoveDeferredLike<R>
  : RemoveDeferredLike<TExpression>;
