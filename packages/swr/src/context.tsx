import React, { createContext, PropsWithChildren } from 'react';
import { ClientInstance } from './interfaces/Client';

export const DatxContext = createContext<ClientInstance | null>(null);

export interface IDatxProviderProps {
  client: ClientInstance;
}

export function DatxProvider({ client, children }: PropsWithChildren<IDatxProviderProps>) {
  return <DatxContext.Provider value={client}>{children}</DatxContext.Provider>;
}

export default DatxContext;
