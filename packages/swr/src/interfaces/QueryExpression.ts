import { IRequestOptions } from '@datx/jsonapi';
import { DatxJsonapiModel } from './DatxJsonapiModel';

export type Operation = 'getOne' | 'getMany' | 'getAll';

export type ExpressionLike = {
  op: Operation;
};

// 1. rewrite type to accept only string | number
// 2. remove generics from expressions
// 3. model type will be returned from the query function

export type GetOneExpression<TModel extends DatxJsonapiModel> = {
  op: 'getOne';
  type: TModel['meta']['type'];
  id: string;
  queryParams?: IRequestOptions['queryParams'];
};

export type GetManyExpression<TModel extends DatxJsonapiModel> = {
  op: 'getMany';
  type: TModel['meta']['type'];
  queryParams?: IRequestOptions['queryParams'];
};

export type GetAllExpression<TModel extends DatxJsonapiModel> = {
  op: 'getAll';
  type: TModel['meta']['type'];
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
};

export type Expression<TModel extends DatxJsonapiModel> =
  | GetOneExpression<TModel>
  | GetManyExpression<TModel>
  | GetAllExpression<TModel>

export type ExpressionArgument<TModel extends DatxJsonapiModel> =
  Expression<TModel>
  | null
  | undefined
  | false;

export type QueryExpression<TModel extends DatxJsonapiModel> =
  | ExpressionArgument<TModel>
  | (() => ExpressionArgument<TModel>);
