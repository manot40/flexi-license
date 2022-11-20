import { Box, Space, Title } from '@mantine/core';

import { CompanyTable } from 'components/company';

export default function CompanyIndex() {
  return (
    <Box>
      <Title order={1}>Manage Company</Title>
      <Space h={32} />
      <CompanyTable />
    </Box>
  );
}
