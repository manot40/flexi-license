import type { AppProps } from 'next/app';

import Head from 'next/head';
import { Public_Sans } from '@next/font/google';
import { NotificationsProvider } from '@mantine/notifications';
import { MantineProvider, type MantineThemeOverride } from '@mantine/core';

import AppLayout from 'layouts/AppLayout';
import AuthProvider from 'components/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>Flexi License</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
        <NotificationsProvider>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </NotificationsProvider>
      </MantineProvider>
    </AuthProvider>
  );
}

const publicSans = Public_Sans({ subsets: ['latin'] });

const theme: MantineThemeOverride = {
  colorScheme: 'light',
  fontFamily: publicSans.style.fontFamily,
};
