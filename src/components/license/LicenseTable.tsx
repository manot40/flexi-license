import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useViewportSize } from '@mantine/hooks';

import { AutoTable, CompanySelect } from 'components/reusable';
import { Box, Center, Flex, Pagination, Space, Group, Select } from '@mantine/core';

export default function LicenseTable() {
  const { push } = useRouter();
  const { width } = useViewportSize();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('' as License['type']);

  const { data, isValidating } = useSWR<Res<User[]>>(
    `/api/v1/license?page=${page}&companyId=${search || ''}&type=${type}:equals`,
    fetcher
  );

  return (
    <>
      <Box>
        <Flex gap={12} direction={{ base: 'column', xs: 'initial' }} justify="space-between">
          <Group spacing={8} position="left" noWrap>
            <CompanySelect
              allowDeselect
              onChange={setSearch}
              placeholder="Search by company"
              w={{ base: '100%', sm: 'auto' }}
            />
            <Select
              defaultValue=""
              sx={{ width: '10rem' }}
              onChange={(v) => setType(v as any)}
              data={[{ value: '', label: 'All Type' }, ...typeSelectData]}
            />
          </Group>
        </Flex>
        <Space h={16} />
        <AutoTable
          highlightOnHover
          columns={columns}
          data={data?.result}
          useScroll={width <= 768}
          isLoading={isValidating}
          onClick={(row) => push(`/dashboard/license/${row.id}`)}
        />
        <Space h={16} />
        {data && !!data.result.length && (
          <Center>
            <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
          </Center>
        )}
      </Box>
    </>
  );
}

const typeSelectData = [
  { value: 'ONPREMISE', label: 'On Premise' },
  { value: 'CLOUD', label: 'Cloud' },
];

const columns = [
  {
    key: 'key',
    title: 'License Key',
  },
  {
    key: 'product',
    title: 'Product',
    render: (row: Product) => `${row.name} (${row.code})`,
  },
  {
    key: 'maxUser',
    title: 'Max User',
  },
  {
    key: 'type',
    title: 'Type',
  },
  {
    key: 'company.name',
    title: 'Company',
  },
  {
    key: 'subscriptionStart',
    title: 'Subscription Start',
    width: 180,
    render: (cell: string) =>
      Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
  },
  {
    key: 'subscriptionEnd',
    title: 'Subscription End',
    width: 180,
    render: (cell: string) =>
      cell ? (
        Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell))
      ) : (
        <i>(on-prem)</i>
      ),
  },

  {
    key: 'updatedAt',
    title: 'Last Update',
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
