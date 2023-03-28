import React, { createContext, PropsWithChildren } from 'react';
import { IClientInstance } from './interfaces/Client';

export const DatxContext = createContext<IClientInstance | null>(null);

export interface IDatxProviderProps {
  client: IClientInstance;
}

export function DatxProvider({ client, children }: PropsWithChildren<IDatxProviderProps>) {
  return <DatxContext.Provider value={client}>{children}</DatxContext.Provider>;
}

export default DatxContext;
