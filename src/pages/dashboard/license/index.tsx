import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';

import { LicenseTable } from 'components/license';
import { Box, Space, Title } from '@mantine/core';

export default function LicenseIndex() {
  const { checkRole } = useAuth();
  const { replace } = useRouter();

  const isEligible = checkRole('SUPPORT');

  useEffect(() => {
    if (!isEligible) replace('/dashboard');
  }, [isEligible, replace]);

  if (!isEligible) return null;

  return (
    <Box>
      <Title order={1}>Manage License</Title>
      <Space h={32} />
      <LicenseTable />
    </Box>
  );
}
