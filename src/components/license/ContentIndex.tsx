import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useViewportSize } from '@mantine/hooks';
import { useAuth } from 'components/AuthContext';

import { AutoTable, CompanySelect } from 'components/reusable';
import { Center, Flex, Pagination, Group, Select, Stack, Title } from '@mantine/core';

export default function LicenseTable() {
  const { width } = useViewportSize();
  const { checkRole } = useAuth();
  const { push, replace } = useRouter();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('' as License['type']);

  const { data } = useSWR<Res<User[]>>(
    `/api/v1/license?page=${page}&companyId=${search || ''}&type=${type}:equals`,
    fetcher
  );

  const isEligible = checkRole('SUPPORT');

  useEffect(() => {
    if (!isEligible) replace('/dashboard');
  }, [isEligible, replace]);

  if (!isEligible) return null;

  return (
    <Stack spacing={32}>
      <Title order={1}>Manage Company</Title>
      <Stack spacing={16}>
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
        <AutoTable
          highlightOnHover
          columns={columns}
          data={data?.result}
          useScroll={width <= 768}
          onClick={(row) => push(`/dashboard/license/${row.id}`)}
        />
        {data && !!data.result.length && (
          <Center>
            <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
          </Center>
        )}
      </Stack>
    </Stack>
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
