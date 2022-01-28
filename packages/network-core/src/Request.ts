import { PureModel, PureCollection, getModelType } from '@datx/core';
import { IResponseObject } from '.';
import { IAsync } from './interfaces/IAsync';
import { IGeneralize } from './interfaces/IGeneralize';
import { INetwork } from './interfaces/INetwork';
import { IRefs } from './interfaces/IRefs';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';
import { ISubrequest } from './interfaces/ISubrequest';
import { Response } from './Response';

// SWR is integrated on this level
export class Request<
  TNetwork extends INetwork,
  TModelClass extends typeof PureModel = typeof PureModel,
  TResponse extends TModelInstance | Array<TModelInstance> =  // @ts-ignore
    | InstanceType<TModelClass>
    | Array<InstanceType<TModelClass>>,
  // @ts-ignore No way to avoid this :( But the final type is correct
  IA extends IAsync<TModelInstance> = ReturnType<TNetwork['execAll']>,
  TModelInstance extends InstanceType<TModelClass> & PureModel = InstanceType<TModelClass>,
> {
  constructor(
    protected readonly refs: IRefs<TNetwork, typeof Request>,
    protected readonly requestData: IRequestDetails,
    protected readonly subrequests: Array<ISubrequest<TResponse, TNetwork, typeof Request>> = [],
  ) {}

  public fetch(
    fetchCollection?: PureCollection,
  ): IGeneralize<Response<TModelInstance, TResponse>, IA> {
    let response: Response<TModelInstance, TResponse>;

    const { response: asyncResponse, abort } = this.refs.network.baseFetch(this.requestData);

    this.abort = abort || this.abort;

    return this.refs.network
      .chain(asyncResponse)
      .then((data: IResponseObject) => {
        const collection = fetchCollection || this.refs.collection || new PureCollection();
        const types = (collection.constructor as typeof PureCollection).types;
        if (this.refs.modelConstructor && types.indexOf(this.refs.modelConstructor) === -1) {
          types.push(this.refs.modelConstructor);
        }

        const resp: IResponseSnapshot = {
          response: data,
          type: getModelType(this.refs.modelConstructor),
        };
        response = new Response(resp, collection);
        return this.refs.network.execAll(
          ...this.subrequests.map((subrequest) =>
            this.refs.network.exec(
              subrequest(this.refs.client, response as any).fetch(collection),
              (subdata: Response) => response.include(this.getKey(), subdata),
            ),
          ),
        );
      })
      .then(() => response).value as IGeneralize<Response<TModelInstance, TResponse>, IA>;
  }

  public abort(): void {
    throw new Error('Abort not supported');
  }

  public getKey(): string {
    return this.requestData.cachingKey;
  }
}
