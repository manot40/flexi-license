import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';

import { ProductTable } from 'components/product';
import { Box, Space, Title } from '@mantine/core';

export default function ProductIndex() {
  const { checkRole } = useAuth();
  const { replace } = useRouter();

  const isAdmin = checkRole('ADMIN');

  useEffect(() => {
    if (!isAdmin) replace('/dashboard');
  }, [isAdmin, replace]);

  if (!isAdmin) return null;

  return (
    <Box>
      <Title order={1}>Manage Product</Title>
      <Space h={32} />
      <ProductTable />
    </Box>
  );
}
