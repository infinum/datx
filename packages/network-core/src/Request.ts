import { Model } from '@datx/core';
import { IAsync } from './interfaces/IAsync';
import { IGeneralize } from './interfaces/IGeneralize';
import { INetwork } from './interfaces/INetwork';
import { IRefs } from './interfaces/IRefs';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { ISubrequest } from './interfaces/ISubrequest';
import { Response } from './Response';

// SWR is integrated on this level
export class Request<
  TNetwork extends INetwork,
  TModel extends typeof Model,
  TResponse extends InstanceType<TModel> | Array<InstanceType<TModel>> =
    | InstanceType<TModel>
    | Array<InstanceType<TModel>>,
  // @ts-ignore
  IA extends IAsync<InstanceType<TModel>> = ReturnType<TNetwork['execAll']>,
> {
  constructor(
    protected readonly refs: IRefs<TNetwork>,
    protected readonly requestData: IRequestDetails,
    protected readonly subrequests: Array<ISubrequest<TResponse, TNetwork>> = [],
  ) {}

  public fetch(): IGeneralize<Response<InstanceType<TModel>>, IA> {
    let response: Response<InstanceType<TModel>>;
    // TODO: Return value should be some kind of a Response object
    return this.refs.network
      .chain(this.refs.network.baseFetch(this.requestData as any)) // TODO
      .then((data) => {
        response = new Response(data, this.refs.collection);
        return this.refs.network.execAll(
          ...this.subrequests.map((subrequest) =>
            this.refs.network.exec(subrequest(this.refs.client, data).fetch(), (subdata: any) =>
              this.refs.collection.add(subdata.data),
            ),
          ),
        );
      })
      .then(() => response).value as IGeneralize<Response<InstanceType<TModel>>, IA>;
  }

  public getKey(_parentKey = ''): string {
    const key = this.requestData.cachingKey;
    const keys = this.subrequests.map((subrequest) => subrequest.toString());
    return [key, ...keys].join(',');
  }
}

export class SwrRequest<
  TNetwork extends INetwork,
  TModel extends typeof Model,
  TResponse extends InstanceType<TModel> | Array<InstanceType<TModel>>,
  IA extends IAsync<InstanceType<TModel>> = IAsync<any>,
> extends Request<TNetwork, TModel, TResponse, IA> {
  public swr(): { key: string; fetcher: () => IGeneralize<Response<InstanceType<TModel>>, IA> } {
    return {
      key: this.getKey(),
      fetcher: this.fetch,
    };
  }
}
