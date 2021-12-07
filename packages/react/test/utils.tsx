import { act, render } from '@testing-library/react';
import React from 'react';
import { SWRConfig } from 'swr';
import { DatxProvider, useSafeClient } from '../src';
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
    const client = useSafeClient(createClient);

    return (
      <DatxProvider client={client}>
        <SWRConfig value={{ provider, ...config }}>{children}</SWRConfig>
      </DatxProvider>
    );
  };

  return render(element, { wrapper: TestSWRConfig });
};
