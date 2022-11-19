import useSWR from 'swr';

import { AutoTable } from 'components/reusable';
import { Box, Flex, ScrollArea, Space, Title } from '@mantine/core';

import fetcher from 'libs/fetcher';

export default function Dashboard() {
  const { data, error } = useSWR<any>('/api/v1/company', fetcher);

  const columns = [
    { key: 'name', title: 'Company Name' },
    { key: 'contactName', title: 'Contact Person' },
    { key: 'contactNumber', title: 'Contact Number' },
    { key: 'updatedAt', title: 'Last Update' },
    { key: 'updatedBy', title: 'Updated By' },
  ];

  return (
    <Box>
      <Title order={1}>Dashboard</Title>
      <Space h={32} />
      <Flex gap={32} direction={{ base: 'column', md: 'row' }}>
        <AutoTable
          highlightOnHover
          columns={columns}
          onClick={(r) => console.log(r)}
          data={data?.result.map((v: any) => ({
            ...v,
            updatedAt: Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short' }).format(
              new Date(v.updatedAt)
            ),
          }))}
        />
        <AutoTable
          highlightOnHover
          columns={columns}
          onClick={(r) => console.log(r)}
          data={data?.result.map((v: any) => ({
            ...v,
            updatedAt: Intl.DateTimeFormat('en', { dateStyle: 'long', timeStyle: 'short' }).format(
              new Date(v.updatedAt)
            ),
          }))}
        />
      </Flex>
    </Box>
  );
}
