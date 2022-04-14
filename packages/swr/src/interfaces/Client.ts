import { PureCollection } from '@datx/core';
import { IJsonapiCollection } from '@datx/jsonapi';

export interface IClient {
  types: {
    readonly type: 'generic';
    new ();
  };
}

export type Client = PureCollection & IJsonapiCollection;

export type ModelTypes = IClient['types'];
