import { Box, Space, Title } from '@mantine/core';
import { LicenseTable } from 'components/license';

export default function LicenseIndex() {
  return (
    <Box>
      <Title order={1}>Manage License</Title>
      <Space h={32} />
      <LicenseTable />
    </Box>
  );
}
