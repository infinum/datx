import { IModelConstructor } from '@datx/core';
import { IRequestOptions, IJsonapiModel } from '@datx/jsonapi';

export type Operation = 'getOne' | 'getMany' | 'getAll';

export type ExpressionLike = {
  op: Operation;
};

export type GetOneExpression<TModel extends IJsonapiModel> = {
  op: 'getOne';
  type: IModelConstructor<TModel>;
  id: string;
  queryParams?: IRequestOptions['queryParams'];
};

export type GetManyExpression<TModel extends IJsonapiModel> = {
  op: 'getMany';
  type: IModelConstructor<TModel>;
  queryParams?: IRequestOptions['queryParams'];
};

export type GetAllExpression<TModel extends IJsonapiModel> = {
  op: 'getAll';
  type: IModelConstructor<TModel>;
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
};

export type Expression<TModel extends IJsonapiModel> =
  | GetOneExpression<TModel>
  | GetManyExpression<TModel>
  | GetAllExpression<TModel>
  | null;

export type QueryExpression<TModel extends IJsonapiModel> =
  | Expression<TModel>
  | (() => Expression<TModel>);
