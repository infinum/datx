import { IRequestOptions } from '@datx/jsonapi';
import { ModelTypes } from './Client';

export interface IGetOneExpression {
  readonly op: 'getOne' | Omit<string, 'getOne'>;
  readonly type: ModelTypes['type'];
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetManyExpression {
  readonly op: 'getMany' | Omit<string, 'getMany'>;
  readonly type: ModelTypes['type'];
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetAllExpression {
  readonly op: 'getAll' | Omit<string, 'getAll'>;
  readonly type: ModelTypes['type'];
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
}

export type DeferredLike = null | undefined | false;

export type ExpressionArgument =
  | IGetOneExpression
  | IGetManyExpression
  | IGetAllExpression
  | DeferredLike;

export type Expression = ExpressionArgument | (() => ExpressionArgument);

export type RemoveDeferredLike<TType> = TType extends DeferredLike ? never : TType;

export type ExactExpressionArgument<TExpression> = TExpression extends () => infer RExpressionFn
  ? RExpressionFn extends () => infer RExpressionArgument
    ? RemoveDeferredLike<RExpressionArgument>
    : RemoveDeferredLike<RExpressionFn>
  : RemoveDeferredLike<TExpression>;

export type FindModel<TTypeLiteral extends string> = {
  [TModel in ModelTypes as TModel['type']]: TModel['type'] extends TTypeLiteral
    ? InstanceType<TModel>
    : never;
}[ModelTypes['type']];
