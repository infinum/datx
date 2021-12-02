import { IJsonapiModel } from "./IJsonapiModel";

export type IResponseData<TModel extends IJsonapiModel = IJsonapiModel> = TModel | Array<TModel> | null;
