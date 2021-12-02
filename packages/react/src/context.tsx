import React, { createContext, PropsWithChildren } from 'react';
import { IJsonapiCollection } from '@datx/jsonapi';
import { JsonapiCollection } from './types';

export const DatxContext = createContext<IJsonapiCollection | null>(null);

export interface IDatxProviderProps<TClient extends JsonapiCollection> {
  client: TClient;
}

export function DatxProvider<TClient extends JsonapiCollection>({
  client,
  children,
}: PropsWithChildren<IDatxProviderProps<TClient>>) {
  return <DatxContext.Provider value={client}>{children}</DatxContext.Provider>;
}

export default DatxContext;
