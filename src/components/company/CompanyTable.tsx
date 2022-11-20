import useSWR from 'swr';
import { useState } from 'react';
import fetcher from 'libs/fetcher';
import { useDebouncedState } from '@mantine/hooks';

import { AutoTable } from 'components/reusable';
import { Box, Button, Center, Chip, Flex, Input, Pagination, Select, Space, Title } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

export default function UserTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useDebouncedState('', 300);

  const { data, isValidating, mutate } = useSWR<Res<User[]>>(`/api/v1/company?page=${page}&name=${search}`, fetcher);

  const columns = [
    {
      key: 'name',
      title: 'Company Name',
    },
    {
      key: 'contactName',
      title: 'Contact Person',
    },
    {
      key: 'contactNumber',
      title: 'Contact Number',
      width: 160,
    },
    {
      key: 'updatedAt',
      title: 'Last Updated',
      width: 180,
      render: (cell: string) =>
        Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
    },
    {
      key: 'updatedBy',
      title: 'Updated By',
      width: 120,
    },
  ];

  return (
    <Box>
      <Title size={18} order={2}>
        Manage Company
      </Title>
      <Space h={12} />

      <Flex gap={12}>
        <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by name" />
        <Button>New Company</Button>
      </Flex>
      <Space h={16} />
      <AutoTable highlightOnHover columns={columns} data={data?.result} isLoading={isValidating} />
      <Space h={16} />
      {data && (
        <Center>
          <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
        </Center>
      )}
    </Box>
  );
}

const ghostInput = { input: { border: 0 } };

const roleSelectData = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'SALES', label: 'Sales' },
];
