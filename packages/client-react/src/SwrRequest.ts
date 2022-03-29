import { PureModel } from '@datx/core';
import { INetwork, Request, Response, IAsync, IGeneralize } from '@datx/network';

export class SwrRequest<
  TNetwork extends INetwork,
  TModel extends typeof PureModel,
  TResponse extends InstanceType<TModel> | Array<InstanceType<TModel>>,
  IA extends IAsync<InstanceType<TModel>> = IAsync<InstanceType<TModel>>,
> extends Request<TNetwork, TModel, TResponse, IA> {
  public swr(): { key: string; fetcher: () => IGeneralize<Response<InstanceType<TModel>>, IA> } {
    return {
      key: this.getKey(),
      fetcher: this.fetch as any, // TODO: fix this
    };
  }
}
