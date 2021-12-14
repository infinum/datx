import { Model } from '@datx/core';
import { IHeaders } from './IHeaders';
import { IRefs } from './IRefs';
import { Request } from '../Request';
import { INetwork } from './INetwork';

export interface IQueryConfig<TNetwork extends INetwork, TRequestClass extends typeof Request> {
  model: typeof Model;
  id?: string;
  // query: Record<string, any>;
  match: Array<Record<string, any>>;
  headers: IHeaders;
  body?: any;
  url?: string;
  method?: string;
  request: TRequestClass;
  refs: IRefs<TNetwork>;
}
