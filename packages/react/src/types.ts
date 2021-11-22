
import { Collection, IModelConstructor, IType } from '@datx/core';
import { IJsonapiModel, IJsonapiCollection, IRequestOptions, Response } from '@datx/jsonapi';
import { SWRConfiguration } from 'swr';
import { Fetcher } from 'swr/dist/types';

export type JsonapiCollection = Collection & IJsonapiCollection;

export type _QueryResource<TModel> = [IType | IModelConstructor<TModel>, number | string, IRequestOptions?];
export type _QueryResourceFn<TModel> = () => _QueryResource<TModel>;
export type QueryResource<TModel> = _QueryResource<TModel> | _QueryResourceFn<TModel>;

export type QueryResourceFn<TModel> = (variables: object) => QueryResource<TModel>;

export type _QueryResources<TModel> = [IType | IModelConstructor<TModel>, IRequestOptions?];
export type _QueryResourcesFn<TModel> = () => _QueryResources<TModel>;
export type QueryResources<TModel> = _QueryResources<TModel> | _QueryResourcesFn<TModel>;

export type QueryResourcesFn<TModel> = (variables: object) => QueryResources<TModel>;

export type QuerySelectFn<TModel> = (data: TModel) => any;

type QuerySelectConfig<TModel extends IJsonapiModel> = {
  select?: QuerySelectFn<TModel>;
  sideload?: (response: Response<TModel>) => Promise<Response<TModel>>;
};

export type QueryConfig<TModel extends IJsonapiModel> = SWRConfiguration<
  Response<TModel>,
  Response<TModel>,
  Fetcher<Response<TModel>>
> &
  QuerySelectConfig<TModel>;

export type Meta = Record<string, unknown>;
