import { IModelConstructor, IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';


export type _QueryResource<TData> = [
  IType | IModelConstructor<TData>,
  number | string,
  IRequestOptions?,
];

export type QueryResource<TData> = _QueryResource<TData> | (() => _QueryResource<TData>);

export type _QueryResources<TData> = [IType | IModelConstructor<TData>, IRequestOptions?];
export type _QueryResourcesFn<TData> = () => _QueryResources<TData>;
export type QueryResources<TData> = _QueryResources<TData> | _QueryResourcesFn<TData>;

export type QueryResourcesFn<TData> = (variables: object) => QueryResources<TData>;

