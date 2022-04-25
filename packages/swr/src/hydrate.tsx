import React, { PropsWithChildren } from 'react';
import { Response } from '@datx/jsonapi';
import { SWRConfig } from 'swr';
import { useClient } from './hooks/useClient';
import { ClientInstance } from './interfaces/Client';
import { Fallback } from './interfaces/Fallback';

const hydrate = (client: ClientInstance, fallback: Fallback | undefined) => {
  return (
    fallback &&
    Object.keys(fallback).reduce((previousValue, currentValue) => {
      const response = fallback[currentValue];

      if (client && response) {
        previousValue[currentValue] = new Response(response, client);
      }

      return previousValue;
    }, {})
  );
};

export interface IHydrateProps {
  fallback: Fallback | undefined;
}

export function Hydrate({ children, fallback }: PropsWithChildren<IHydrateProps>) {
  const client = useClient();

  return <SWRConfig value={{ fallback: hydrate(client, fallback) }}>{children}</SWRConfig>;
}
