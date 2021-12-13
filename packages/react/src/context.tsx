import React, { createContext, PropsWithChildren } from 'react';
import { Client } from './interfaces/Client';

export const DatxContext = createContext<Client | null>(null);

export interface IDatxProviderProps<TClient extends Client> {
  client: TClient;
}

export function DatxProvider<TClient extends Client>({
  client,
  children,
}: PropsWithChildren<IDatxProviderProps<TClient>>) {
  return <DatxContext.Provider value={client}>{children}</DatxContext.Provider>;
}

export default DatxContext;
