import type { AppProps } from 'next/app';
import { DatxProvider } from '@datx/react';
import { createClient } from '../datx/createClient';

const store = createClient();

function MyApp({ Component, pageProps }: AppProps) {
  return <DatxProvider store={store}><Component {...pageProps} /></DatxProvider>
}

export default MyApp
