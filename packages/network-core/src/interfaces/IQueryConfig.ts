import { IHeaders } from './IHeaders';
import { IRefs } from './IRefs';
import { Request } from '../Request';
import { INetwork } from './INetwork';

export interface IQueryConfig<TNetwork extends INetwork, TRequestClass extends typeof Request> {
  id?: string;
  match: Array<Record<string, unknown>>;
  headers: IHeaders;
  body?: FormData | string | null | Record<string, unknown> | Array<unknown>;
  url?: string;
  method?: string;
  request: TRequestClass;
  refs: IRefs<TNetwork, TRequestClass>;
}
