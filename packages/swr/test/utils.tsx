import { Response } from '@datx/jsonapi';
import { act, render, renderHook } from '@testing-library/react';
import React, { FC } from 'react';
import { SWRConfig } from 'swr';
import { createFetcher, DatxProvider, useInitialize } from '../src';
import { createClient } from './datx';

export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const nextTick = () => act(() => sleep(1));

const provider = () => new Map();

interface ITestSWRConfig {
  children: React.ReactNode;
  config?: Parameters<typeof SWRConfig>[0]['value'];
}

export const TestSWRConfig: FC<ITestSWRConfig> = ({ children, config }) => {
  const client = useInitialize(createClient);

  return (
    <DatxProvider client={client}>
      <SWRConfig value={{ provider, fetcher: createFetcher(client), ...config }}>
        {children}
      </SWRConfig>
    </DatxProvider>
  );
};

export const renderHookWithConfig = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  config?: Parameters<typeof SWRConfig>[0]['value'],
) =>
  renderHook<TResult, TProps>(callback, {
    wrapper: ({ children }: any) => <TestSWRConfig config={config}>{children}</TestSWRConfig>,
  });

export const renderWithConfig = (
  element: React.ReactElement,
  config?: Parameters<typeof SWRConfig>[0]['value'],
): ReturnType<typeof render> => {
  return render(element, {
    wrapper: ({ children }) => <TestSWRConfig config={config}>{children}</TestSWRConfig>,
  });
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
