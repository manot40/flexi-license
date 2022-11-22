import { useAuth } from 'components/AuthContext';

import { CompanyTable } from 'components/company';
import { Box, Space, Title } from '@mantine/core';

export default function CompanyIndex() {
  const { checkRole } = useAuth();
  return (
    <Box>
      <Title order={1}>Manage Company</Title>
      <Space h={32} />
      <CompanyTable checkRole={checkRole} />
    </Box>
  );
}
