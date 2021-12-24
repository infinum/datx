import { IJsonapiModel } from "@datx/jsonapi";
import { ResourceListArguments } from "./ResourceListArguments";

export type ResourceListKey<TModel extends IJsonapiModel> = ResourceListArguments<TModel> | (() => ResourceListArguments<TModel>);
