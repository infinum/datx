import { PureCollection, PureModel } from '@datx/core';
import { IJsonapiCollection, IJsonapiModel, IRequestOptions } from '@datx/jsonapi';

export type JsonapiClient = typeof PureCollection & IJsonapiCollection;

export declare class JsonapiModel extends PureModel implements IJsonapiModel {
  public static readonly type: string;
  public save(options?: IRequestOptions): Promise<IJsonapiModel>;
  public destroy(options?: IRequestOptions): Promise<void>;
}

export type JsonapiModelType = typeof JsonapiModel;

export interface IGenericResource extends JsonapiModelType {
  readonly type: 'generic';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IClient {}

export type ClientInternal = IClient extends { types: Array<unknown> }
  ? IClient
  : {
      types: Array<IGenericResource>;
      new (...args: any): JsonapiClient;
    } & IJsonapiCollection;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IClientInstance extends InstanceType<ClientInternal> {}

export type ModelTypes = ClientInternal['types'][number];
