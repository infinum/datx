import { PureModel } from 'datx';
import { useCallback, useEffect, useState } from 'react';

import { baseFetch, getDefaultConfig } from './defaults';
import { IConfigType } from './interfaces/IConfigType';
import { IHeaders } from './interfaces/IHeaders';
import { IInterceptor } from './interfaces/IInterceptor';
import { IPipeOperator } from './interfaces/IPipeOperator';
import { Response } from './Response';
import { IFetchOptions } from './interfaces/IFetchOptions';
import { IResponseObject } from './interfaces/IResponseObject';
import { deepCopy, interpolateParams, appendQueryParams } from './helpers/utils';
import { INetworkHandler } from './interfaces/INetworkHandler';
import { HttpMethod } from './enums/HttpMethod';
import { cacheInterceptor } from './cache';
import { BodyType } from './enums/BodyType';

interface IHookOptions {
  suspense?: boolean;
}

interface IRequestOptions {
  method: HttpMethod;
  url?: string;
  params: Record<string, string>;
  query: Record<string, string | Array<string> | object>;
  headers: IHeaders;
  body?: any;
  bodyType: BodyType;
}

export class BaseRequest<TModel extends PureModel = PureModel, TParams extends object = {}> {
  private _config: IConfigType = getDefaultConfig();
  private _interceptors: Array<IInterceptor> = [];
  private _options: IRequestOptions = {
    method: HttpMethod.Get,
    headers: {},
    query: {},
    params: {},
    bodyType: BodyType.Json,
  };

  constructor(baseUrl: string) {
    this._config.baseUrl = baseUrl;
  }

  protected baseFetch(
    method: string,
    url: string,
    body?: string | FormData,
    requestHeaders?: IHeaders,
  ): Promise<IResponseObject> {
    return baseFetch(this, method, url, body, requestHeaders);
  }

  public pipe<
    TNewModel extends PureModel | Array<PureModel> = TModel,
    TNewParams extends object = TParams
  >(...operators: Array<IPipeOperator | undefined>): BaseRequest<TNewModel, TNewParams> {
    const destinationPipeline = this.clone<TNewModel, TNewParams>();
    operators
      .filter(Boolean)
      .forEach((operator) => (operator as IPipeOperator)(destinationPipeline));

    return destinationPipeline as BaseRequest<TNewModel, TNewParams>;
  }

  private doRequest(options: IFetchOptions): Promise<IResponseObject> {
    return this.baseFetch(options.method, options.url, options.data, this._options.headers).then(
      (resp) => {
        return {
          data: resp.data,
          status: resp.status,
          headers: resp.headers,
          requestHeaders: resp.requestHeaders,
          error: resp.error,
          collection: resp.collection,
          type: this._config.type,
        };
      },
      (resp) => {
        return Promise.reject({
          data: resp.data,
          status: resp.status,
          headers: resp.headers,
          requestHeaders: resp.requestHeaders,
          error: resp.error,
          collection: resp.collection,
          type: this._config.type,
        });
      },
    );
  }

  private processBody(): string | FormData | undefined {
    if (!this._options.body) {
      return;
    }

    const body = this._config.serialize
      ? this._config.serialize(this._options.body, this._options.bodyType)
      : this._options.body;

    if (this._options.bodyType === BodyType.Json) {
      this._options.headers['content-type'] =
        this._options.headers['content-type'] || 'application/json';
      return typeof body === 'string' ? body : JSON.stringify(body);
    } else if (this._options.bodyType === BodyType.Urlencoded) {
      this._options.headers['content-type'] =
        this._options.headers['content-type'] || 'application/x-www-form-urlencoded';
      return typeof body === 'string'
        ? body
        : appendQueryParams(
            '',
            body,
            this._config.paramArrayType,
            this._config.encodeQueryString,
          ).slice(1);
    } else if (this._options.bodyType === BodyType.Multipart) {
      this._options.headers['content-type'] =
        this._options.headers['content-type'] || 'multipart/form-data';
      return body instanceof FormData ? body : new FormData(body);
    } else {
      return typeof body === 'string' ? body : JSON.stringify(body);
    }
  }

  public fetch(params?: TParams): Promise<Response<TModel>> {
    if (!this._options.url) {
      throw new Error('URL should be defined');
    }
    const urlParams = Object.assign({}, this._options.params, params);
    const url = interpolateParams(`${this._config.baseUrl}${this._options.url}`, urlParams);
    const processedUrl = appendQueryParams(
      url,
      this._options.query,
      this._config.paramArrayType,
      this._config.encodeQueryString,
    );
    const initialCallback = this._interceptors.reverse().reduce(
      (callback: INetworkHandler<TModel>, interceptor: IInterceptor<TModel>) => {
        return (options: IFetchOptions): Promise<Response<TModel>> =>
          interceptor(options, callback);
      },
      (options: IFetchOptions) => {
        return cacheInterceptor<TModel>(
          this._config.cache,
          this._config.maxCacheAge,
          this,
        )(options, this.doRequest.bind(this));
      },
    );

    // The error is not handled on purpose so UnhandledPromiseRejectionWarning is triggered if the client doesn't handle the error
    return initialCallback({
      url: processedUrl,
      method: this._options.method,
      data: this.processBody(),
      collection: this._config.collection,
      options: {
        networkConfig: {
          headers: this._options.headers,
        },
      },
      views: this._config.views,
    });
  }

  public useHook(
    params?: TParams,
    options?: IHookOptions,
  ): [Response<TModel> | null, boolean, string | Error | null] {
    const [loader, setLoader] = useState<Promise<Response<TModel>> | null>(null);
    const [value, setValue] = useState<Response<TModel> | null>(null);
    const [error, setError] = useState<string | Error | null>(null);

    const execute = useCallback(() => {
      const loaderPromise = this.fetch(params);
      setLoader(loaderPromise);
      setValue(null);
      setError(null);

      return loaderPromise
        .then((response) => {
          setValue(response);
          setLoader(null);
        })
        .catch((error) => {
          setError(error);
          setLoader(null);
        });
    }, [this.fetch, params]);

    useEffect(() => {
      execute();
    }, [execute]);

    if (options?.suspense && loader) {
      throw loader;
    }

    return [value, Boolean(loader), error];
  }

  public clone<TNewModel extends PureModel = TModel, TNewParams extends object = TParams>(
    BaseRequestConstructor: typeof BaseRequest = this.constructor as typeof BaseRequest,
  ): BaseRequest<TNewModel, TNewParams> {
    // Can't use `new BaseRequest`, because we would lose the overridden methods
    const clone = new BaseRequestConstructor<TNewModel, TNewParams>(this._config.baseUrl);
    clone._config = deepCopy(this._config);
    clone._interceptors = this._interceptors.slice();
    clone._options = deepCopy(this._options);

    // Manually copy complex objects
    clone._config.collection = this._config.collection;
    clone._config.type = this._config.type;
    clone._config.fetchReference = this._config.fetchReference;

    return clone as BaseRequest<TNewModel, TNewParams>;
  }
}
