import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';

import { UserTable } from 'components/admin';
import { Stack, Tabs, Title } from '@mantine/core';

export default function Users() {
  const { checkRole } = useAuth();
  const { replace } = useRouter();

  const isAdmin = checkRole('ADMIN');

  useEffect(() => {
    if (!isAdmin) replace('/dashboard');
  }, [isAdmin, replace]);

  if (!isAdmin) return null;

  return (
    <Stack spacing={32}>
      <Title order={1}>Admin Panel</Title>
      <Tabs variant="outline" defaultValue="users">
        <Tabs.List>
          <Tabs.Tab value="users">Users</Tabs.Tab>
          <Tabs.Tab value="apiTokens">API Tokens</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="lg">
          <UserTable />
        </Tabs.Panel>

        <Tabs.Panel value="apiTokens" pt="xs">
          TODO: API token Management
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
