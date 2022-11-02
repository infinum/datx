import { ClientInstance } from './Client';

export type CreateClientFn<TClientInstance extends ClientInstance = ClientInstance> =
  () => TClientInstance;
