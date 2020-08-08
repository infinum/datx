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
  private _options: IRequestOptions = {
    method: HttpMethod.Get,
    headers: {},
    query: {},
    params: {},
    bodyType: BodyType.Json,
  };
  private _interceptors: Array<IInterceptor> = [];

  public get config(): IConfigType {
    return this._config;
  }

  public get options(): IRequestOptions {
    return this._options;
  }

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

  public pipe<TNewModel extends PureModel = TModel, TNewParams extends object = TParams>(
    ...operators: Array<IPipeOperator>
  ): BaseRequest<TNewModel, TNewParams> {
    const destinationPipeline = this.clone<TNewModel, TNewParams>();
    operators.forEach((operator) => operator(destinationPipeline));

    return destinationPipeline as BaseRequest<TNewModel, TNewParams>;
  }

  private doRequest(options: IFetchOptions): Promise<IResponseObject> {
    return this.baseFetch(options.method, options.url, options.data, this.options.headers).then(
      (resp) => {
        return {
          data: resp.data,
          status: resp.status,
          headers: resp.headers,
          requestHeaders: resp.requestHeaders,
          error: resp.error,
          collection: resp.collection,
        };
      },
    );
  }

  private processBody(): string | FormData | undefined {
    if (!this._options.body) {
      return;
    }
    if (this._options.bodyType === BodyType.Json) {
      this._options.headers['Content-Type'] = 'application/json';
      return typeof this._options.body === 'string'
        ? this._options.body
        : JSON.stringify(this._options.body);
    } else if (this._options.bodyType === BodyType.Urlencoded) {
      this._options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      return typeof this._options.body === 'string'
        ? this._options.body
        : appendQueryParams(
            '',
            this._options.body,
            this._config.paramArrayType,
            this._config.encodeQueryString,
          ).slice(1);
    } else if (this._options.bodyType === BodyType.Multipart) {
      return this._options.body instanceof FormData
        ? this._options.body
        : new FormData(this._options.body);
    } else {
      return typeof this._options.body === 'string'
        ? this._options.body
        : JSON.stringify(this._options.body);
    }
  }

  public fetch(params?: TParams): Promise<Response<TModel>> {
    if (!this.options.url) {
      throw new Error('URL should be defined');
    }
    const urlParams = Object.assign({}, this.options.params, params);
    const url = interpolateParams(this.options.url, urlParams);
    const processedUrl = appendQueryParams(
      url,
      this.options.query,
      this.config.paramArrayType,
      this.config.encodeQueryString,
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
    NetworkPipelineConstructor: typeof BaseRequest = this.constructor as typeof BaseRequest,
  ): BaseRequest<TNewModel, TNewParams> {
    // Can't use `new NetworkPipeline`, because we would lose the overridden methods
    const clone = new NetworkPipelineConstructor<PureModel, {}>(this._config.baseUrl);
    clone._config = deepCopy(this._config);
    clone._interceptors = this._interceptors.slice();
    clone._options = deepCopy(this._options);

    return clone as BaseRequest<TNewModel, TNewParams>;
  }
}
