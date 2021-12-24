import { IJsonapiModel, IResponseData, Response } from "@datx/jsonapi";

export type QuerySelectFn<TModel extends IJsonapiModel, TData extends IResponseData> = <TSelection>(data: Response<TModel, TData>) => TSelection;
