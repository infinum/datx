import { IRequestOptions } from '@datx/jsonapi';
import { JsonapiModelType, ModelTypes } from './Client';

export interface IGetOneExpression<TModel extends JsonapiModelType = JsonapiModelType> {
  readonly op: 'getOne';
  readonly type: TModel['type'];
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetManyExpression<TModel extends JsonapiModelType = JsonapiModelType> {
  readonly op: 'getMany';
  readonly type: TModel['type'];
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetAllExpression<TModel extends JsonapiModelType = JsonapiModelType> {
  readonly op: 'getAll';
  readonly type: TModel['type'];
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
}

export interface IGetRelatedResourceExpression<
  TModelType extends JsonapiModelType = JsonapiModelType,
> {
  readonly op: 'getRelatedResource';
  readonly type: TModelType['type'];
  readonly relation: string;
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}

export interface IGetRelatedResourcesExpression<
  TModelType extends JsonapiModelType = JsonapiModelType,
> {
  readonly op: 'getRelatedResources';
  readonly type: TModelType['type'];
  readonly relation: string;
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}

export type DeferredLike = null | undefined | false;

export type ExpressionArgument =
  | IGetOneExpression
  | IGetManyExpression
  | IGetAllExpression
  | IGetRelatedResourceExpression
  | IGetRelatedResourcesExpression
  | DeferredLike;

export type InfiniteExpressionArgument =
  | IGetManyExpression
  | IGetRelatedResourcesExpression
  | DeferredLike;

export type Expression = ExpressionArgument | (() => ExpressionArgument);

export type InfiniteExpression = InfiniteExpressionArgument | (() => InfiniteExpressionArgument);

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

export type FetcherExpressionArgument = RemoveDeferredLike<ExpressionArgument>;
