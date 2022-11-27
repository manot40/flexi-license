import { Public_Sans } from '@next/font/google';
import { NotificationsProvider } from '@mantine/notifications';
import { MantineProvider, type MantineThemeOverride } from '@mantine/core';

import AuthProvider from 'components/AuthContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </MantineProvider>
    </AuthProvider>
  );
}

const publicSans = Public_Sans({ subsets: ['latin'] });

const theme: MantineThemeOverride = {
  colorScheme: 'light',
  fontFamily: publicSans.style.fontFamily,
  globalStyles: (theme) => ({
    body: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.colors.gray[0] },
  }),
};
