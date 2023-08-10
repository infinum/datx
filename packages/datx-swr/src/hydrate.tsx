import { PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { useClient } from './hooks/useClient';
import { IClientInstance } from './interfaces/Client';
import { Fallback } from './interfaces/Fallback';
import { hydrateResponse } from './Response';

const hydrate = (client: IClientInstance, fallback: Fallback) => {
  return Object.entries(fallback).reduce((previousValue, [key, dehydratedResponse]) => {
    previousValue[key] = hydrateResponse(key, dehydratedResponse, client);

    return previousValue;
  }, {});
};

export interface IHydrateProps {
  fallback: Fallback | undefined;
}

export function Hydrate({ children, fallback }: PropsWithChildren<IHydrateProps>) {
  const client = useClient();

  if (!fallback) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'You are using <Hydrate /> without a fallback.',
        'Did you forget to pass a fallback from getStaticProps/getServerSideProps?',
      );
    }

    return <>{children}</>;
  }

  return <SWRConfig value={{ fallback: hydrate(client, fallback) }}>{children}</SWRConfig>;
}
