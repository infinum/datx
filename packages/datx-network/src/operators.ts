import { BaseRequest } from './BaseRequest';
import { IInterceptor } from './interfaces/IInterceptor';
import { CachingStrategy } from './enums/CachingStrategy';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { ParamArrayType } from './enums/ParamArrayType';
import { PureCollection } from 'datx';

export function setUrl(url: string) {
  return (pipeline: BaseRequest): void => {
    pipeline.options.url = url;
  };
}

export function addInterceptor(interceptor: IInterceptor) {
  return (pipeline: BaseRequest): void => {
    pipeline['_interceptors'].push(interceptor);
  };
}

export function cache(strategy: CachingStrategy, maxAge = Infinity) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.cache = strategy;
    pipeline.config.maxCacheAge = maxAge;
  };
}

export function method(method: HttpMethod) {
  return (pipeline: BaseRequest): void => {
    pipeline.options.method = method;
  };
}

export function body(body: any, bodyType?: BodyType) {
  return (pipeline: BaseRequest): void => {
    if (bodyType || bodyType === 0) {
      pipeline.options.bodyType = bodyType;
    } else if (body instanceof FormData) {
      pipeline.options.bodyType = BodyType.Multipart;
    } else if (typeof body === 'object') {
      pipeline.options.bodyType = BodyType.Json;
    } else {
      pipeline.options.bodyType = BodyType.Raw;
    }
    pipeline.options.body = pipeline.config.serialize(body, pipeline.options.bodyType);
  };
}

export function query(name: string, value: string | Array<string> | object) {
  return (pipeline: BaseRequest): void => {
    pipeline.options.query[name] = value;
  };
}

export function header(name: string, value: string) {
  return (pipeline: BaseRequest): void => {
    pipeline.options.headers[name] = value;
  };
}

export function params(name: string, value: string): (pipeline: BaseRequest) => void;
export function params(params: Record<string, string>): (pipeline: BaseRequest) => void;
export function params(name: string | Record<string, string>, value?: string) {
  return (pipeline: BaseRequest): void => {
    if (typeof name === 'string') {
      pipeline.options.params[name] = value as string;
    } else {
      Object.assign(pipeline.options.params, name);
    }
  };
}

export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.fetchReference = fetchReference;
  };
}

export function encodeQueryString(encodeQueryString: boolean) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.encodeQueryString = encodeQueryString;
  };
}

export function paramArrayType(paramArrayType: ParamArrayType) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.paramArrayType = paramArrayType;
  };
}

export function serializer(serialize: (data: object, _type: BodyType) => object) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.serialize = serialize;
  };
}

export function parser(parse: (data: object) => object) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.parse = parse;
  };
}

export function collection(collection?: PureCollection) {
  return (pipeline: BaseRequest): void => {
    pipeline.config.collection = collection;
  };
}
