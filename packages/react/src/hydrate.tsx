import React, { PropsWithChildren } from 'react';
import { Response, IResponseSnapshot } from '@datx/jsonapi';
import { SWRConfig } from 'swr';
import { JsonapiCollection } from './types';
import { useDatx } from './hooks/useDatx';

type Fallback = Record<string, IResponseSnapshot>;

export const hydrate = (client: JsonapiCollection, fallback: Fallback) => {
  return Object.keys(fallback).reduce((previousValue, currentValue) => {
    const data = fallback[currentValue];

    if (client && data) {
      if (Array.isArray(data)) {
        previousValue[currentValue] = data.map((rowResponse) => {
          new Response({ data: rowResponse, status: 200 }, client);
        });
      }
      previousValue[currentValue] = new Response({ data, status: 200 }, client);
    }

    return previousValue;
  }, {});
};

export interface IHydrateProps {
  fallback: Fallback;
}

export function Hydrate({ children, fallback }: PropsWithChildren<IHydrateProps>) {
  const client = useDatx();

  return <SWRConfig value={{ fallback: hydrate(client, fallback) }}>{children}</SWRConfig>;
}
