import { BaseRequest } from './BaseRequest';
import { IInterceptor } from './interfaces/IInterceptor';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { ParamArrayType } from './enums/ParamArrayType';
import { PureCollection, IType, PureModel } from '@datx/core';
import { IRequestOptions } from './interfaces/IRequestOptions';

export function setUrl<TResponseType>(url: string, type: IType | typeof PureModel = PureModel) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_options'].url = url;
    pipeline['_config'].type = type;
  };
}

export function addInterceptor<TResponseType>(fn: IInterceptor<TResponseType>, name: string = fn.name) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline.interceptors = pipeline.interceptors.filter(
      (interceptor) => interceptor.name !== name,
    );

    pipeline.interceptors.push({ name, fn });
  };
}

export function upsertInterceptor<TResponseType>(fn: IInterceptor<TResponseType>, name: string = fn.name) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    const interceptor = pipeline.interceptors.find((interceptor) => interceptor.name === name);

    if (interceptor) {
      interceptor.fn = fn;
    } else {
      pipeline.interceptors.push({ name, fn });
    }
  };
}

export function removeInterceptor<TResponseType>(name: string) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline.interceptors = pipeline.interceptors.filter(
      (interceptor) => interceptor.name !== name,
    );
  };
}

export function method<TResponseType>(method: HttpMethod) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_options'].method = method;
  };
}

export function body<TResponseType>(body: unknown, bodyType?: BodyType) {
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

export function query<TResponseType>(
  name: string,
  value: string | Array<string> | Record<string, unknown> | undefined,
): (pipeline: BaseRequest<TResponseType>) => void;
export function query<TResponseType>(
  params: Record<string, string | Array<string> | Record<string, unknown> | undefined>,
): (pipeline: BaseRequest<TResponseType>) => void;
export function query<TResponseType>(
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

export function header<TResponseType>(name: string, value: string): (pipeline: BaseRequest<TResponseType>) => void;
export function header<TResponseType>(params: Record<string, string>): (pipeline: BaseRequest<TResponseType>) => void;
export function header<TResponseType>(name: string | Record<string, string>, value?: string) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (typeof name === 'string') {
      pipeline['_options'].headers[name] = value || '';
    } else {
      Object.assign(pipeline['_options'].headers, name);
    }
  };
}

export function params<TResponseType>(name: string, value: string): (pipeline: BaseRequest<TResponseType>) => void;
export function params<TResponseType>(params: Record<string, string>): (pipeline: BaseRequest<TResponseType>) => void;
export function params<TResponseType>(name: string | Record<string, string>, value?: string) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (typeof name === 'string') {
      pipeline['_options'].params[name] = value as string;
    } else {
      Object.assign(pipeline['_options'].params, name);
    }
  };
}

export function encodeQueryString<TResponseType>(encodeQueryString: boolean) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_config'].encodeQueryString = encodeQueryString;
  };
}

export function paramArrayType<TResponseType>(paramArrayType: ParamArrayType) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_config'].paramArrayType = paramArrayType;
  };
}

export function collection<TResponseType>(collection?: PureCollection) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    pipeline['_config'].collection = collection;
  };
}

export function requestOptions<TResponseType>(options?: IRequestOptions) {
  return (pipeline: BaseRequest<TResponseType>): void => {
    if (options?.query) {
      query(options?.query)(pipeline);
    }

    if (options?.networkConfig?.headers) {
      header(options?.networkConfig?.headers)(pipeline);
    }
  };
}
