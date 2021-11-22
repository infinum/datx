import React, { createContext, PropsWithChildren } from 'react';
import { Collection } from '@datx/core';
import { IJsonapiCollection } from '@datx/jsonapi';
import { SWRConfig } from 'swr';
import { JsonapiCollection } from './types';

export const DatxContext = createContext<Collection & IJsonapiCollection | null>(null);

export interface IDatxProviderProps{
  store: JsonapiCollection;
}

export function DatxProvider({ store, children }: PropsWithChildren<IDatxProviderProps>) {
  return (
    <DatxContext.Provider value={store}>
      <SWRConfig
        value={{
          // fetcher: store?.fetcher,
          // fallback: hydrate(store, fallback),
        }}
      >
        {children}
      </SWRConfig>
    </DatxContext.Provider>
  );
}

export default DatxContext;
