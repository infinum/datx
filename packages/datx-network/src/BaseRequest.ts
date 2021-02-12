import { PureModel } from '@datx/core';

import { getDefaultConfig } from './defaults';
import { IConfigType } from './interfaces/IConfigType';
import { IHeaders } from './interfaces/IHeaders';
import { IInterceptor } from './interfaces/IInterceptor';
import { IPipeOperator } from './interfaces/IPipeOperator';
import { Response } from './Response';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { deepCopy, interpolateParams, appendQueryParams } from './helpers/utils';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { body as bodyOperator } from './operators';

interface IRequestOptions {
  method: HttpMethod;
  url?: string;
  params: Record<string, string>;
  query: Record<string, string | Array<string> | Record<string, unknown> | undefined>;
  headers: IHeaders;
  body?: unknown;
  bodyType: BodyType;
}

interface IInterceptorObject<TInterceptor> {
  name: string;
  fn: TInterceptor;
}

type IInterceptorsList<TModel> = Array<IInterceptorObject<IInterceptor<TModel>>>;

export class BaseRequest<TModel extends PureModel = PureModel, TParams extends Record<string, unknown> = Record<string, unknown>> {
  private _config: IConfigType = getDefaultConfig();
  private _options: IRequestOptions = {
    method: HttpMethod.Get,
    headers: {},
    query: {},
    params: {},
    bodyType: BodyType.Json,
  };

  public interceptors: IInterceptorsList<TModel> = [];

  constructor(baseUrl: string) {
    this._config.baseUrl = baseUrl;
  }

  public pipe<
    TNewModel extends PureModel | Array<PureModel> = TModel,
    TNewParams extends Record<string, unknown> = TParams
  >(...operators: Array<IPipeOperator | undefined>): BaseRequest<TNewModel, TNewParams> {
    const destinationPipeline = this.clone<TNewModel, TNewParams>();
    operators
      .filter(Boolean)
      .forEach((operator) => (operator as IPipeOperator)(destinationPipeline));

    return destinationPipeline as BaseRequest<TNewModel, TNewParams>;
  }

  private processBody(): Record<string, unknown> | string | FormData | undefined {
    if (!this._options.body) {
      return;
    }

    if (this._options.bodyType === BodyType.Json) {
      this._options.headers['content-type'] =
        this._options.headers['content-type'] || 'application/json';
      return this._options.body as Record<string, unknown>;
    } else if (this._options.bodyType === BodyType.Urlencoded) {
      this._options.headers['content-type'] =
        this._options.headers['content-type'] || 'application/x-www-form-urlencoded';
      return typeof this._options.body === 'string'
        ? this._options.body
        : appendQueryParams(
            '',
            this._options.body as Record<string, string>,
            this._config.paramArrayType,
            this._config.encodeQueryString,
          ).slice(1);
    } else if (this._options.bodyType === BodyType.Multipart) {
      this._options.headers['content-type'] =
        this._options.headers['content-type'] || 'multipart/form-data';
      return this._options.body instanceof FormData
        ? this._options.body
        : new FormData(this._options.body as any);
    } else {
      return this._options.body as string;
    }
  }

  public fetch(
    params?: TParams | null,
    queryParams?: Record<string, string | Array<string> | Record<string, unknown>> | null,
    body?: unknown,
    bodyType?: BodyType,
  ): Promise<Response<TModel>> {
    const request = body === undefined ? this : this.pipe(bodyOperator(body, bodyType));

    if (!request._options.url) {
      throw new Error('URL should be defined');
    }
    const urlParams = Object.assign({}, request._options.params, params || {});
    const url = interpolateParams(`${request._config.baseUrl}${request._options.url}`, urlParams);
    const processedUrl = appendQueryParams(
      url,
      Object.assign({}, request._options.query, queryParams),
      request._config.paramArrayType,
      request._config.encodeQueryString,
    );

    const requestRef: IFetchOptions = {
      url: processedUrl,
      method: request._options.method,
      data: request.processBody(),
      collection: request._config.collection,
      params,
      options: {
        networkConfig: {
          headers: request._options.headers,
        },
      },
      views: request._config.views,
      type: request._config.type,
    };

    const interceptorChain = request.interceptors.reduce((next, interceptor) => {
      return (options: IFetchOptions): Promise<Response<TModel>> => interceptor.fn(options, next);
    }, undefined);

    if (!interceptorChain) {
      throw new Error('Something went wrong');
    }

    return interceptorChain(requestRef);
  }

  public clone<TNewModel extends PureModel = TModel, TNewParams extends Record<string, unknown> = TParams>(
    BaseRequestConstructor: typeof BaseRequest = this.constructor as typeof BaseRequest,
  ): BaseRequest<TNewModel, TNewParams> {
    // Can't use `new BaseRequest`, because we would lose the overridden methods
    const clone = new BaseRequestConstructor<TNewModel, TNewParams>(this._config.baseUrl);

    clone.interceptors = deepCopy(this.interceptors) as unknown as Array<{ name: string, fn: IInterceptor<TNewModel> }>;

    clone._config = deepCopy(this._config);
    clone._options = deepCopy(this._options);

    // Manually copy complex objects
    clone._config.collection = this._config.collection;
    clone._config.fetchInterceptor = this._config.fetchInterceptor;
    clone._config.fetchReference = this._config.fetchReference;
    clone._config.Response = this._config.Response;
    clone._config.type = this._config.type;

    return clone as BaseRequest<TNewModel, TNewParams>;
  }
}
