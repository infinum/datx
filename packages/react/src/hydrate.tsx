import React, { PropsWithChildren } from 'react';
import { Response, IResponseSnapshot, IRawResponse } from '@datx/jsonapi';
import { SWRConfig } from 'swr';
import { JsonapiCollection } from './types';
import { useDatx } from './hooks/useDatx';

type Fallback = Record<string, IResponseSnapshot>;

export const hydrate = (client: JsonapiCollection, fallback: Fallback) => {
  return Object.keys(fallback).reduce((previousValue, currentValue) => {
    const {response, options} = fallback[currentValue];

    if (client && response) {
      previousValue[currentValue] = new Response(response as IRawResponse, client, options);
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
