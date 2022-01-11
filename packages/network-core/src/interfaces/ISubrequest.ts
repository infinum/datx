import { Client } from '../Client';
import { Request } from '../Request';
import { Response } from '../Response';
import { INetwork } from './INetwork';

export type ISubrequest<
  TResponse,
  TNetwork extends INetwork,
  TRequestClass extends typeof Request,
> = (
  client: Client<TNetwork, TRequestClass>,
  parentData: Response<TResponse, TResponse>,
  // @ts-ignore
) => Request<TNetwork>;
