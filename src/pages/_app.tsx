import type { AppProps } from 'next/app';

import Head from 'next/head';

import AppLayout from 'layouts/AppLayout';
import Providers from 'components/Providers';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Flexi License</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <Providers>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </Providers>
    </>
  );
}
