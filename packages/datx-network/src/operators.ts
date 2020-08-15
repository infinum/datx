import { BaseRequest } from './BaseRequest';
import { IInterceptor } from './interfaces/IInterceptor';
import { CachingStrategy } from './enums/CachingStrategy';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { ParamArrayType } from './enums/ParamArrayType';
import { PureCollection, IType, PureModel } from 'datx';
import { IResponseObject } from './interfaces/IResponseObject';

export function setUrl(url: string, type: IType | typeof PureModel = PureModel) {
  return (pipeline: BaseRequest): void => {
    pipeline['_options'].url = url;
    pipeline['_config'].type = type;
  };
}

export function addInterceptor(interceptor: IInterceptor) {
  return (pipeline: BaseRequest): void => {
    pipeline['_interceptors'].push(interceptor);
  };
}

export function cache(strategy: CachingStrategy, maxAge = Infinity) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].cache = strategy;
    pipeline['_config'].maxCacheAge = maxAge;
  };
}

export function method(method: HttpMethod) {
  return (pipeline: BaseRequest): void => {
    pipeline['_options'].method = method;
  };
}

export function body(body: any, bodyType?: BodyType) {
  return (pipeline: BaseRequest): void => {
    if (bodyType || bodyType === 0) {
      pipeline['_options'].bodyType = bodyType;
    } else if (body instanceof FormData) {
      pipeline['_options'].bodyType = BodyType.Multipart;
    } else if (typeof body === 'object') {
      pipeline['_options'].bodyType = BodyType.Json;
    } else {
      pipeline['_options'].bodyType = BodyType.Raw;
    }
    pipeline['_options'].body = body;
  };
}

export function query(name: string, value: string | Array<string> | object) {
  return (pipeline: BaseRequest): void => {
    pipeline['_options'].query[name] = value;
  };
}

export function header(name: string, value: string) {
  return (pipeline: BaseRequest): void => {
    pipeline['_options'].headers[name] = value;
  };
}

export function params(name: string, value: string): (pipeline: BaseRequest) => void;
export function params(params: Record<string, string>): (pipeline: BaseRequest) => void;
export function params(name: string | Record<string, string>, value?: string) {
  return (pipeline: BaseRequest): void => {
    if (typeof name === 'string') {
      pipeline['_options'].params[name] = value as string;
    } else {
      Object.assign(pipeline['_options'].params, name);
    }
  };
}

export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].fetchReference = fetchReference;
  };
}

export function encodeQueryString(encodeQueryString: boolean) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].encodeQueryString = encodeQueryString;
  };
}

export function paramArrayType(paramArrayType: ParamArrayType) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].paramArrayType = paramArrayType;
  };
}

export function serializer(serialize: (data: any, type: BodyType) => any) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].serialize = serialize;
  };
}

export function parser(parse: (data: IResponseObject) => IResponseObject) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].parse = parse;
  };
}

export function collection(collection?: PureCollection) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].collection = collection;
  };
}
