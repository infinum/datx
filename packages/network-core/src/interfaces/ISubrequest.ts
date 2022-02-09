import { Client } from '../Client';
import { Request } from '../Request';
import { Response } from '../Response';
import { INetwork } from './INetwork';
import { ISubrequestData } from './ISubrequestData';

export type ISubrequest<
  TResponse,
  TNetwork extends INetwork,
  TRequestClass extends typeof Request,
> = (
  client: Client<TNetwork, TRequestClass>,
  parentData: Response<TResponse, TResponse>,
) => ISubrequestData<TNetwork> | Array<ISubrequestData<TNetwork>>;
