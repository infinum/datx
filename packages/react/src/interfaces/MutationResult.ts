import { IJsonapiModel, IResponseData, Response } from "@datx/jsonapi";
import { MutationResetFn } from "./MutationResetFn";
import { MutationStatus } from "./MutationStatus";

export type MutationResult<TInput, TModel extends IJsonapiModel, TData extends IResponseData> = [
  (input: TInput) => Promise<Response<TModel, TData> | undefined>,
  { status: MutationStatus; data?: Response<TModel, TData>; error?: Response<TModel, TData>; reset: MutationResetFn },
];
