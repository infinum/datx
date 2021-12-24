import { IJsonapiModel, IResponseData, Response } from "@datx/jsonapi";
import { MutationStatus } from "./MutationStatus";

export type MutationState<TModel extends IJsonapiModel, TData extends IResponseData> = {
  status: MutationStatus;
  data?: Response<TModel, TData>;
  error?: Response<TModel, TData>;
};
