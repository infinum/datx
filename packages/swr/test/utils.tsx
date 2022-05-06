import { Response } from '@datx/jsonapi';
import { act, render } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import { createFetcher, DatxProvider, useInitialize } from '../src';
import { createClient } from './datx';

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const nextTick = () => act(() => sleep(1));

export const renderWithConfig = (
  element: React.ReactElement,
  config?: Parameters<typeof SWRConfig>[0]['value'],
): ReturnType<typeof render> => {
  const provider = () => new Map();

  const TestSWRConfig = ({ children }: { children: React.ReactNode }) => {
    const client = useInitialize(createClient);

    return (
      <DatxProvider client={client}>
        <SWRConfig value={{ provider, fetcher: createFetcher(client), ...config }}>
          {children}
        </SWRConfig>
      </DatxProvider>
    );
  };

  return render(element, { wrapper: TestSWRConfig });
};

export const getErrorMessage = (response: Response) => {
  const { error, status } = response;

  if (error instanceof Error) {
    return `status: ${status}; error: ${error.message}; stack: ${error.stack}`;
  }

  if (error instanceof Array) {
    return error.map((error) => error.detail);
  }

  return JSON.stringify(error);
};
