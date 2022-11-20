import { Box, Space, Title } from '@mantine/core';

import { UserTable } from 'components/user';

export default function Users() {
  return (
    <Box>
      <Title order={1}>Manage Users</Title>
      <Space h={32} />
      <UserTable />
    </Box>
  );
}
