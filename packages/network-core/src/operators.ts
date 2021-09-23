import { BaseRequest } from './BaseRequest';
import { IInterceptor } from './interfaces/IInterceptor';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { ParamArrayType } from './enums/ParamArrayType';
import { PureCollection, IType, PureModel } from '@datx/core';
import { IRequestOptions } from './interfaces/IRequestOptions';
import { IAsync } from './interfaces/IAsync';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { IResponseObject } from './interfaces/IResponseObject';
import { IFinalInterceptor } from './interfaces/IFinalInterceptor';
import { fetchInterceptor } from './interceptors/fetch';

export function setUrl<TResponseType extends IAsync>(
  url: string,
  type: IType | typeof PureModel = PureModel,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_options'].url = url;
    pipeline['_config'].type = type;
  };
}

export function addInterceptor<TResponseType extends IAsync>(
  fn: IInterceptor<TResponseType>,
  name: string = fn.name,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline.interceptors = pipeline.interceptors.filter(
      (interceptor) => interceptor.name !== name,
    );

    pipeline.interceptors.push({ name, fn });
  };
}

export function upsertInterceptor<TResponseType extends IAsync>(
  fn: IInterceptor<TResponseType> | IFinalInterceptor,
  name: string = fn.name,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    const interceptor = pipeline.interceptors.find((interceptor) => interceptor.name === name);

    if (interceptor) {
      interceptor.fn = fn;
    } else {
      pipeline.interceptors.push({ name, fn });
    }
  };
}

export function removeInterceptor<TResponseType extends IAsync>(name: string) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline.interceptors = pipeline.interceptors.filter(
      (interceptor) => interceptor.name !== name,
    );
  };
}

export function method<TResponseType extends IAsync>(method: HttpMethod) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_options'].method = method;
  };
}

export function body<TResponseType extends IAsync>(body: unknown, bodyType?: BodyType) {
  return (pipeline: BaseRequest<TResponseType>): void => {
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

export function query<TResponseType extends IAsync>(
  name: string,
  value: string | Array<string> | Record<string, unknown> | undefined,
): (pipeline: BaseRequest<TResponseType>) => void;
export function query<TResponseType extends IAsync>(
  params: Record<string, string | Array<string> | Record<string, unknown> | undefined>,
): (pipeline: BaseRequest<TResponseType>) => void;
export function query<TResponseType extends IAsync>(
  name: string | Record<string, string | Array<string> | Record<string, unknown> | undefined>,
  value?: string | Array<string> | Record<string, unknown> | undefined,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (typeof name === 'string') {
      pipeline['_options'].query[name] = value;
    } else {
      Object.assign(pipeline['_options'].query, name);
    }
  };
}

export function header<TResponseType extends IAsync>(
  name: string,
  value: string,
): (pipeline: BaseRequest<TResponseType>) => void;
export function header<TResponseType extends IAsync>(
  params: Record<string, string>,
): (pipeline: BaseRequest<TResponseType>) => void;
export function header<TResponseType extends IAsync>(
  name: string | Record<string, string>,
  value?: string,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (typeof name === 'string') {
      pipeline['_options'].headers[name] = value || '';
    } else {
      Object.assign(pipeline['_options'].headers, name);
    }
  };
}

export function params<TResponseType extends IAsync>(
  name: string,
  value: string,
): (pipeline: BaseRequest<TResponseType>) => void;
export function params<TResponseType extends IAsync>(
  params: Record<string, string>,
): (pipeline: BaseRequest<TResponseType>) => void;
export function params<TResponseType extends IAsync>(
  name: string | Record<string, string>,
  value?: string,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (typeof name === 'string') {
      pipeline['_options'].params[name] = value as string;
    } else {
      Object.assign(pipeline['_options'].params, name);
    }
  };
}

export function encodeQueryString<TResponseType extends IAsync>(encodeQueryString: boolean) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_config'].encodeQueryString = encodeQueryString;
  };
}

export function paramArrayType<TResponseType extends IAsync>(paramArrayType: ParamArrayType) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_config'].paramArrayType = paramArrayType;
  };
}

export function collection<TResponseType extends IAsync>(collection?: PureCollection) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_config'].collection = collection;
  };
}

export function requestOptions<TResponseType extends IAsync>(options?: IRequestOptions) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (options?.query) {
      query(options?.query)(pipeline);
    }

    if (options?.networkConfig?.headers) {
      header(options?.networkConfig?.headers)(pipeline);
    }
  };
}

export function serializer<TResponseType extends IAsync>(
  serialize: (request: IFetchOptions) => IFetchOptions,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    const config = pipeline['_config'];
    config.serialize = serialize;
    upsertInterceptor(
      fetchInterceptor(config.network, config.serialize, config.parse, config.Response) as any,
      'fetch',
    )(pipeline);
  };
}

export function parser<TResponseType extends IAsync>(
  parse: (data: Record<string, unknown>, response: IResponseObject) => Record<string, unknown>,
) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    const config = pipeline['_config'];
    config.parse = parse;
    upsertInterceptor(
      fetchInterceptor(config.network, config.serialize, config.parse, config.Response) as any,
      'fetch',
    )(pipeline);
  };
}
