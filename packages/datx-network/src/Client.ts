import { IGeneralize } from './interfaces/IGeneralize';
import { INetwork } from './interfaces/INetwork';
import { PureCollection, PureModel } from '@datx/core';

export abstract class NetworkClient<TNetwork extends INetwork> {
  constructor(
    public readonly store: PureCollection,
    public readonly Network: TNetwork,
    private readonly config = {},
  ) {}

  // Calls baseFetch but also executes the interceptor chain
  // Arguments here should be more abstract
  fetch(url: string, init?: object): ReturnType<TNetwork['baseFetch']> {
    return this.Network.baseFetch(url, init) as ReturnType<TNetwork['baseFetch']>;
  }

  abstract getOne<TModel extends typeof PureModel, TInstance = InstanceType<TModel>>(
    type: TModel,
    id: string,
  ): // @ts-ignore
  IGeneralize<TInstance, ReturnType<TNetwork['exec']>>;

  //getMany(type)
  //save(model)
  //destroy(model)
}
