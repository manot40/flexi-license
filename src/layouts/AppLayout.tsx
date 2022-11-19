import { Flex, Box } from '@mantine/core';

import Navigation from 'components/Navigation';

export default function AppLayout({ children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Flex style={{ height: '100vh' }}>
      <Navigation />
      <Box
        sx={(theme) => ({
          '@media (min-width: 768px)': { padding: '1rem 2rem' },
          padding: theme.spacing.md,
          width: '100%',
        })}>
        {children}
      </Box>
    </Flex>
  );
}
