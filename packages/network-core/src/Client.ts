import { IGeneralize } from './interfaces/IGeneralize';
import { INetwork } from './interfaces/INetwork';
import { PureCollection, PureModel } from '@datx/core';
import { BaseRequest } from './BaseRequest';
import { Response } from './Response';

export class NetworkClient<TNetwork extends INetwork> {
  constructor(public readonly store: PureCollection, public readonly Network: TNetwork) {}

  public get request(): BaseRequest<ReturnType<TNetwork['exec']>> {
    return this.Network.baseRequest as BaseRequest<ReturnType<TNetwork['exec']>>;
  }

  public fetch<T extends PureModel = PureModel>(): IGeneralize<
    Response<T>,
    ReturnType<TNetwork['exec']>
  > {
    return this.request.fetch() as IGeneralize<Response<T>, ReturnType<TNetwork['exec']>>;
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
