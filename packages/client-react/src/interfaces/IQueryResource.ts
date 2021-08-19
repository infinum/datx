import { IModelConstructor, IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';

export type QueryResource<TModel> = [
  IType | IModelConstructor<TModel>,
  number | string,
  IRequestOptions?,
];
