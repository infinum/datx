import React, { createContext, PropsWithChildren } from 'react';
import { Client } from './interfaces/Client';

export const DatxContext = createContext<InstanceType<Client> | null>(null);

export interface IDatxProviderProps {
  client: InstanceType<Client>;
}

export function DatxProvider({ client, children }: PropsWithChildren<IDatxProviderProps>) {
  return <DatxContext.Provider value={client}>{children}</DatxContext.Provider>;
}

export default DatxContext;
