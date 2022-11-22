import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';

import { UserTable } from 'components/user';
import { Box, Space, Title } from '@mantine/core';

export default function Users() {
  const { checkRole } = useAuth();
  const { replace } = useRouter();

  const isAdmin = checkRole('ADMIN');

  useEffect(() => {
    if (!isAdmin) replace('/dashboard');
  }, [isAdmin, replace]);

  if (!isAdmin) return null;

  return (
    <Box>
      <Title order={1}>Manage Users</Title>
      <Space h={32} />
      <UserTable />
    </Box>
  );
}
