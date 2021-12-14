import { IJsonapiModel } from "@datx/jsonapi";
import { ResourceArguments } from "./ResourceArguments";

export type ResourceKey<TModel extends IJsonapiModel> = ResourceArguments<TModel> | (() => ResourceArguments<TModel>);
