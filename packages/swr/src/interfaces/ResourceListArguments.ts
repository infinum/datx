import { IModelConstructor, IType } from "@datx/core";
import { IJsonapiModel, IRequestOptions } from "@datx/jsonapi";

export type ResourceListArguments<TModel extends IJsonapiModel> = [IType | IModelConstructor<TModel>, IRequestOptions['queryParams']?];
