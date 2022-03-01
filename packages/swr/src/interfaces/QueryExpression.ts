import { IRequestOptions } from '@datx/jsonapi';
import { DatxJsonapiModel } from './DatxJsonapiModel';

export type Operation = 'getOne' | 'getMany' | 'getAll';

export type ExpressionLike = {
  op: Operation;
};

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
  | GetAllExpression<TModel>;

export type QueryExpression<TModel extends DatxJsonapiModel> =
  | Expression<TModel>
  | (() => Expression<TModel>);
