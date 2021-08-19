import { IGeneralize } from './interfaces/IGeneralize';
import { INetwork } from './interfaces/INetwork';
import { PureCollection, PureModel } from '@datx/core';
import { IInterceptorsList } from './interfaces/IInterceptorsList';
import { IAsync } from './interfaces/IAsync';
import { BaseRequest } from './BaseRequest';
import { Response } from './Response';
import { addInterceptor } from './operators';

interface IClientConfig<TAsync extends IAsync> {
  baseUrl?: string;
  interceptors?: Array<IInterceptorsList<TAsync>>;
}

export class NetworkClient<TNetwork extends INetwork> {
  protected __request: BaseRequest<ReturnType<TNetwork['exec']>>;

  constructor(
    public readonly store: PureCollection,
    public readonly Network: TNetwork,
    private readonly config: IClientConfig<ReturnType<TNetwork['exec']>> = {},
  ) {
    this.__request = new BaseRequest<ReturnType<TNetwork['exec']>>(this.config.baseUrl || '/');
    if (this.config.interceptors) {
      // @ts-ignore
      this.__request.interceptors = this.config.interceptors;
    }

    this.__request = this.__request.pipe(addInterceptor(this.Network.baseFetch, 'fetch'));
  }

  public get request(): BaseRequest<ReturnType<TNetwork['exec']>> {
    return this.__request;
  }

  public fetch<T extends PureModel = PureModel>(): IGeneralize<
    Response<T>,
    ReturnType<TNetwork['exec']>
  > {
    return this.__request.fetch() as IGeneralize<Response<T>, ReturnType<TNetwork['exec']>>;
  }

  // abstract getOne<TModel extends typeof PureModel, TInstance = InstanceType<TModel>>(
  //   type: TModel,
  //   id: string,
  // ): IGeneralize<Response<TInstance>, ReturnType<TNetwork['exec']>>;

  // getMany(type)
  // save(model)
  // destroy(model)
  // request(url, options);
  // request(options);
}
