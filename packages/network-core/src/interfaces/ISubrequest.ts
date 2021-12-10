import { Client } from '../Client';
import { Request } from '../Request';
import { INetwork } from './INetwork';

export type ISubrequest<TResponse, TNetwork extends INetwork> = (
  client: Client<TNetwork>,
  parentData: TResponse,
  // @ts-ignore
) => Request<TNetwork>;
