import React, { createContext, PropsWithChildren } from 'react';
import { IJsonapiCollection } from '@datx/jsonapi';
import { JsonapiCollection } from './types';

export const DatxContext = createContext<IJsonapiCollection | null>(null);

export interface IDatxProviderProps<TStore extends JsonapiCollection> {
  store: TStore;
}

export function DatxProvider<TStore extends JsonapiCollection>({
  store,
  children,
}: PropsWithChildren<IDatxProviderProps<TStore>>) {
  return <DatxContext.Provider value={store}>{children}</DatxContext.Provider>;
}

export default DatxContext;
