import type { AppProps } from 'next/app';
import { DatxProvider, useSafeClient } from '@datx/react';
import { createClient } from '../datx/createClient';

function ExampleApp({ Component, pageProps }: AppProps) {
  const client = useSafeClient(createClient);

  return (
    <DatxProvider client={client}>
      <Component {...pageProps} />
    </DatxProvider>
  );
}

export default ExampleApp;
