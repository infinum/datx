import { BaseRequest } from './BaseRequest';
import { IInterceptor } from './interfaces/IInterceptor';
import { CachingStrategy } from './enums/CachingStrategy';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { ParamArrayType } from './enums/ParamArrayType';
import { PureCollection, IType, PureModel } from 'datx';
import { cacheInterceptor } from './interceptors/cache';
import { IResponseObject } from './interfaces/IResponseObject';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { IRequestOptions } from './interfaces/IRequestOptions';

export function setUrl(url: string, type: IType | typeof PureModel = PureModel) {
  return (pipeline: BaseRequest): void => {
    pipeline['_options'].url = url;
    pipeline['_config'].type = type;
  };
}

export function addInterceptor(fn: IInterceptor, name: string = fn.name) {
  return (pipeline: BaseRequest): void => {
    pipeline.interceptors = pipeline.interceptors.filter(
      (interceptor) => interceptor.name !== name,
    );

    pipeline.interceptors.push({ name, fn });
  };
}

export function upsertInterceptor(fn: IInterceptor, name: string = fn.name) {
  return (pipeline: BaseRequest): void => {
    const interceptor = pipeline.interceptors.find((interceptor) => interceptor.name === name);

    if (interceptor) {
      interceptor.fn = fn;
    } else {
      pipeline.interceptors.push({ name, fn });
    }
  };
}

export function removeInterceptor(name: string) {
  return (pipeline: BaseRequest): void => {
    pipeline.interceptors = pipeline.interceptors.filter(
      (interceptor) => interceptor.name !== name,
    );
  };
}

export function cache(
  strategy: CachingStrategy,
  maxAge = Infinity,
): (pipeline: BaseRequest) => void {
  return upsertInterceptor(cacheInterceptor(strategy, maxAge), 'cache');
}

export function method(method: HttpMethod) {
  return (pipeline: BaseRequest): void => {
    pipeline['_options'].method = method;
  };
}

export function body(body: unknown, bodyType?: BodyType) {
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

export function query(
  name: string,
  value: string | Array<string> | object | undefined,
): (pipeline: BaseRequest) => void;
export function query(
  params: Record<string, string | Array<string> | object | undefined>,
): (pipeline: BaseRequest) => void;
export function query(
  name: string | Record<string, string | Array<string> | object | undefined>,
  value?: string | Array<string> | object | undefined,
) {
  return (pipeline: BaseRequest): void => {
    if (typeof name === 'string') {
      pipeline['_options'].query[name] = value;
    } else {
      Object.assign(pipeline['_options'].query, name);
    }
  };
}

export function header(name: string, value: string): (pipeline: BaseRequest) => void;
export function header(params: Record<string, string>): (pipeline: BaseRequest) => void;
export function header(name: string | Record<string, string>, value?: string) {
  return (pipeline: BaseRequest): void => {
    if (typeof name === 'string') {
      pipeline['_options'].headers[name] = value || '';
    } else {
      Object.assign(pipeline['_options'].headers, name);
    }
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

export function fetchReference(fetchReference: typeof fetch) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    config.fetchReference = fetchReference;
    upsertInterceptor(
      config.fetchInterceptor(
        config.fetchReference,
        config.serialize,
        config.parse,
        config.Response,
      ),
      'fetch',
    )(pipeline);
  };
}

export function serializer(serialize: (request: IFetchOptions) => IFetchOptions) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    config.serialize = serialize;
    upsertInterceptor(
      config.fetchInterceptor(
        config.fetchReference,
        config.serialize,
        config.parse,
        config.Response,
      ),
      'fetch',
    )(pipeline);
  };
}

export function parser(parse: (data: object, response: IResponseObject) => object) {
  return (pipeline: BaseRequest): void => {
    const config = pipeline['_config'];
    config.parse = parse;
    upsertInterceptor(
      config.fetchInterceptor(
        config.fetchReference,
        config.serialize,
        config.parse,
        config.Response,
      ),
      'fetch',
    )(pipeline);
  };
}

export function collection(collection?: PureCollection) {
  return (pipeline: BaseRequest): void => {
    pipeline['_config'].collection = collection;
  };
}

export function requestOptions(options?: IRequestOptions) {
  return (pipeline: BaseRequest): void => {
    if (options?.query) {
      query(options?.query)(pipeline);
    }

    if (options?.networkConfig?.headers) {
      header(options?.networkConfig?.headers)(pipeline);
    }

    if (options?.cacheOptions?.cachingStrategy) {
      cache(options?.cacheOptions?.cachingStrategy, options?.cacheOptions?.maxAge)(pipeline);
    }
  };
}
