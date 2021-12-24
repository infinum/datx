import { IModelConstructor, IType } from '@datx/core';
import { IRequestOptions, IJsonapiModel } from '@datx/jsonapi';

type Operations = 'getOne' | 'getMany' | 'getAll';

export interface GetManyQueryExpression<TModel> {
  op: Operations;
  type: IType | IModelConstructor<TModel>;
  options?: IRequestOptions;
};

export interface GetOneQueryExpression<TModel> extends GetManyQueryExpression<TModel> {
  id: string;
};


export interface GetAllQueryExpression<TModel> extends GetManyQueryExpression<TModel> {
  maxRequests: number;
};

export type QueryExpression<TModel extends IJsonapiModel = IJsonapiModel> =
  | GetOneQueryExpression<TModel>
  | GetManyQueryExpression<TModel>
  | GetAllQueryExpression<TModel>;
