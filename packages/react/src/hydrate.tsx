import React, { PropsWithChildren } from 'react';
import { Response, IResponseSnapshot, IRawResponse } from '@datx/jsonapi';
import { SWRConfig } from 'swr';
import { useDatx } from './hooks/useDatx';
import { Client } from './interfaces/Client';

type Fallback = Record<string, IResponseSnapshot>;

const hydrate = (client: Client, fallback: Fallback | undefined) => {
  return fallback && Object.keys(fallback).reduce((previousValue, currentValue) => {
    const {response, options} = fallback[currentValue];

    if (client && response) {
      previousValue[currentValue] = new Response(response as IRawResponse, client, options);
    }

    return previousValue;
  }, {});
};

export interface IHydrateProps {
  fallback: Fallback | undefined;
}

export function Hydrate({ children, fallback }: PropsWithChildren<IHydrateProps>) {
  const client = useDatx();

  return <SWRConfig value={{ fallback: hydrate(client, fallback) }}>{children}</SWRConfig>;
}
