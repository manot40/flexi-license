import { Box, Space, Title } from '@mantine/core';

import UsersTable from 'components/UsersTable';

export default function Users() {
  return (
    <Box>
      <Title order={1}>Manage Users</Title>
      <Space h={32} />
      <UsersTable />
    </Box>
  );
}
