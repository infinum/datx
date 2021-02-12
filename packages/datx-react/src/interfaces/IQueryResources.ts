import { IModelConstructor, IType } from '@datx/core';
import { IRequestOptions } from '@datx/jsonapi';

export type QueryResources<TModel> = [IType | IModelConstructor<TModel>, IRequestOptions?];
