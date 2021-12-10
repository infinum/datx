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
  TResponse extends Model | Array<Model>,
  TNetwork extends INetwork,
  IA extends IAsync<Model> = IAsync<any>,
> {
  constructor(
    protected readonly refs: IRefs<TNetwork>,
    protected readonly requestData: IRequestDetails,
    protected readonly subrequests: Array<ISubrequest<TResponse, TNetwork>> = [],
  ) {}

  public fetch(): IGeneralize<Response<Model>, IA> {
    let response: Response<Model>;
    // TODO: Return value should be some kind of a Response object
    return this.refs.network
      .chain(this.refs.network.baseFetch(this.requestData as any)) // TODO
      .then((data) => {
        response = new Response(data, this.refs.collection);
        return this.refs.network.execAll(
          ...this.subrequests.map((subrequest) =>
            this.refs.network.exec(
              subrequest(this.refs.client, data).fetch(),
              (subdata: Array<Model>) => this.refs.collection.add(subdata),
            ),
          ),
        );
      })
      .then(() => response).value as IGeneralize<Response<Model>, IA>;
  }

  public getKey(_parentKey = ''): string {
    const key = this.requestData.cachingKey;
    const keys = this.subrequests.map((subrequest) => subrequest.toString());
    return [key, ...keys].join(',');
  }
}

export class SwrRequest<
  TResponse extends Model | Array<Model>,
  TNetwork extends INetwork,
  IA extends IAsync<Model> = IAsync<any>,
> extends Request<TResponse, TNetwork, IA> {
  public swr(): { key: string; fetcher: () => IGeneralize<Response<Model>, IA> } {
    return {
      key: this.getKey(),
      fetcher: this.fetch,
    };
  }
}
