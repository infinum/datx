import { NetworkPipeline } from './NetworkPipeline';
import { IInterceptor } from './interfaces/IInterceptor';
import { CachingStrategy } from './enums/CachingStrategy';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { ParamArrayType } from './enums/ParamArrayType';

export function setUrl(url: string) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.options.url = url;
  };
}

export function addInterceptor(interceptor: IInterceptor) {
  return (pipeline: NetworkPipeline): void => {
    pipeline['_interceptors'].push(interceptor);
  };
}

export function cache(strategy: CachingStrategy, maxAge = Infinity) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.config.cache = strategy;
    pipeline.config.maxCacheAge = maxAge;
  };
}

export function method(method: HttpMethod) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.options.method = method;
  };
}

export function body(body: any, bodyType: BodyType = BodyType.Json) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.options.body = pipeline.config.serialize(body, bodyType);
    pipeline.options.bodyType = bodyType;
  };
}

export function query(name: string, value: string | Array<string> | object) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.options.query[name] = value;
  };
}

export function header(name: string, value: string) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.options.headers[name] = value;
  };
}

export function params(name: string, value: string): (pipeline: NetworkPipeline) => void;
export function params(params: Record<string, string>): (pipeline: NetworkPipeline) => void;
export function params(name: string | Record<string, string>, value?: string) {
  return (pipeline: NetworkPipeline): void => {
    if (typeof name === 'string') {
      pipeline.options.params[name] = value as string;
    } else {
      Object.assign(pipeline.options.params, name);
    }
  };
}

export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.config.fetchReference = fetchReference;
  };
}

export function encodeQueryString(encodeQueryString: boolean) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.config.encodeQueryString = encodeQueryString;
  };
}

export function paramArrayType(paramArrayType: ParamArrayType) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.config.paramArrayType = paramArrayType;
  };
}

export function serializer(serialize: (data: object, _type: BodyType) => object) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.config.serialize = serialize;
  };
}

export function parser(parse: (data: object) => object) {
  return (pipeline: NetworkPipeline): void => {
    pipeline.config.parse = parse;
  };
}
