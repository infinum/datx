import { PureCollection, PureModel } from '@datx/core';
import { IJsonapiCollection, IJsonapiModel, IRequestOptions } from '@datx/jsonapi';

export type JsonapiClient = typeof PureCollection & IJsonapiCollection;

export declare class JsonapiModel extends PureModel implements IJsonapiModel {
  public save(options?: IRequestOptions): Promise<IJsonapiModel>;
  public destroy(options?: IRequestOptions): Promise<void>;
}

export type JsonapiModelType = typeof JsonapiModel;

export interface IGenericModel extends JsonapiModelType {
  readonly type: 'generic';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IClient {}

export type Client = IClient extends { types: Array<unknown> }
  ? IClient
  : {
      types: Array<IGenericModel>;
      new (...args: any): JsonapiClient;
    };

export type ModelTypes = Client['types'][number];
