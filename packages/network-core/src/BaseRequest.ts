import { PureModel } from '@datx/core';

import { getDefaultConfig } from './defaults';
import { IConfigType } from './interfaces/IConfigType';
import { IPipeOperator } from './interfaces/IPipeOperator';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { deepCopy, interpolateParams, appendQueryParams } from './helpers/utils';
import { HttpMethod } from './enums/HttpMethod';
import { BodyType } from './enums/BodyType';
import { body as bodyOperator } from './operators';
import { IRequestConfig } from './interfaces/IRequestConfig';
import { IInterceptorsList } from './interfaces/IInterceptorsList';
import { IAsync } from './interfaces/IAsync';
import { Network } from './Network';

export class BaseRequest<
  TAsync extends IAsync,
  TModel extends PureModel = PureModel,
  TParams extends Record<string, unknown> = Record<string, unknown>,
> {
  protected _config: IConfigType = getDefaultConfig() as IConfigType;
  protected _options: IRequestConfig = {
    method: HttpMethod.Get,
    headers: {},
    query: {},
    params: {},
    bodyType: BodyType.Json,
  };

  public interceptors: IInterceptorsList<TAsync> = [];

  constructor(baseUrl: string, network: Network<IAsync<any>>) {
    this._config.baseUrl = baseUrl;
    this._config.network = network;
  }

  public update(...operators: Array<IPipeOperator | undefined>): void {
    operators.filter(Boolean).forEach((operator) => (operator as IPipeOperator)(this));
  }

  public pipe<
    TNewModel extends PureModel | Array<PureModel> = TModel,
    TNewParams extends Record<string, unknown> = TParams,
  >(...operators: Array<IPipeOperator | undefined>): BaseRequest<TAsync, TNewModel, TNewParams> {
    const destinationPipeline = this.clone<TNewModel, TNewParams>();
    operators
      .filter(Boolean)
      .forEach((operator) => (operator as IPipeOperator)(destinationPipeline));

    return destinationPipeline as BaseRequest<TAsync, TNewModel, TNewParams>;
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
        : new FormData(this._options.body as HTMLFormElement);
    } else {
      return this._options.body as string;
    }
  }

  public fetch(
    params?: TParams | null,
    queryParams?: Record<string, string | Array<string> | Record<string, unknown>> | null,
    body?: unknown,
    bodyType?: BodyType,
  ): TAsync {
    const request = body === undefined ? this : (this.pipe(bodyOperator(body, bodyType)) as this);

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
      return (options: IFetchOptions): TAsync => interceptor.fn(options, next) as any;
    }, undefined);

    if (!interceptorChain) {
      throw new Error('Something went wrong');
    }

    return interceptorChain(requestRef);
  }

  public clone<
    TNewModel extends PureModel = TModel,
    TNewParams extends Record<string, unknown> = TParams,
  >(
    BaseRequestConstructor: typeof BaseRequest = this.constructor as typeof BaseRequest,
  ): BaseRequest<TAsync, TNewModel, TNewParams> {
    // Can't use `new BaseRequest`, because we would lose the overridden methods
    const clone = new BaseRequestConstructor<TAsync, TNewModel, TNewParams>(this._config.baseUrl, this._config.network);

    clone.interceptors = deepCopy(this.interceptors) as IInterceptorsList<TAsync>;

    clone._config = deepCopy(this._config);
    clone._options = deepCopy(this._options);

    // Manually copy complex objects
    clone._config.collection = this._config.collection;
    clone._config.fetchInterceptor = this._config.fetchInterceptor;
    clone._config.fetchReference = this._config.fetchReference;
    clone._config.Response = this._config.Response;
    clone._config.type = this._config.type;

    return clone as BaseRequest<TAsync, TNewModel, TNewParams>;
  }
}
