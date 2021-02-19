import { BodyType } from "../enums/BodyType";
import { HttpMethod } from "../enums/HttpMethod";
import { IHeaders } from "./IHeaders";

export interface IRequestConfig {
  method: HttpMethod;
  url?: string;
  params: Record<string, string>;
  query: Record<string, string | Array<string> | Record<string, unknown> | undefined>;
  headers: IHeaders;
  body?: unknown;
  bodyType: BodyType;
}