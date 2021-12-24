import { IModelConstructor, IType } from '@datx/core';
import { IJsonapiModel, IRequestOptions } from '@datx/jsonapi';

export type ResourceArguments<TModel extends IJsonapiModel> = [
  IType | IModelConstructor<TModel>,
  number | string,
  IRequestOptions['queryParams']?,
];
