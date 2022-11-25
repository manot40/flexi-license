import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useViewportSize } from '@mantine/hooks';

import LicenseForm from './LicenseForm';
import ExtendLicense from './ExtendLicense';
import { IconSquarePlus, IconEdit } from '@tabler/icons';
import { AutoTable, CompanySelect } from 'components/reusable';
import { Center, Flex, Pagination, Group, Select, Stack, Title, ActionIcon, Modal, Card } from '@mantine/core';

export default function LicenseTable() {
  const { query } = useRouter();
  const { width } = useViewportSize();

  const [page, setPage] = useState(+(query.page || 1));
  const [type, setType] = useState((query.type || '') as License['type']);
  const [search, setSearch] = useState(query.companyId || '');

  const [isExtend, setIsExtend] = useState(false);
  const [license, setLicense] = useState<Partial<License> | null>(null);

  const { data, mutate } = useSWR<Res<User[]>>(
    `/api/v1/license?page=${page}&companyId=${search || ''}&type=${type}:equals`,
    fetcher
  );

  const renderedColumn = useMemo(() => {
    const cols = [...columns];

    cols.push({
      key: 'id',
      title: 'Action',
      render: (_: any, row: License) => (
        <Group noWrap spacing={4} position="left" onClick={(e) => e.stopPropagation()}>
          <ActionIcon color="blue" onClick={() => setLicense(row)}>
            <IconEdit size={16} stroke={1.5} />
          </ActionIcon>
          {row.type === 'CLOUD' && row.key && (
            <ActionIcon color="blue" onClick={() => (setLicense(row), setIsExtend(true))}>
              <IconSquarePlus size={16} stroke={1.5} />
            </ActionIcon>
          )}
        </Group>
      ),
    } as any);

    return cols;
  }, []);

  return (
    <Stack spacing={32}>
      <Title order={1}>Manage License</Title>
      <Card shadow="sm" radius="md" p="lg">
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
                value={type}
                sx={{ width: '10rem' }}
                onChange={(v) => setType(v as any)}
                data={[{ value: '', label: 'All Type' }, ...typeSelectData]}
              />
            </Group>
          </Flex>
          <AutoTable highlightOnHover data={data?.result} columns={renderedColumn} useScroll={width <= 768} />
          {data && !!data.result.length && (
            <Center>
              <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
            </Center>
          )}
        </Stack>
      </Card>
      <Modal
        opened={!!license}
        title={isExtend ? 'Extend License' : 'Edit License'}
        onClose={() => (setLicense(null), setIsExtend(false))}>
        {isExtend ? (
          <ExtendLicense data={license} onSubmitted={() => (setLicense(null), mutate())} />
        ) : (
          <LicenseForm value={license} onSubmitted={() => (setLicense(null), mutate())} />
        )}
      </Modal>
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
    render: (val?: string) => val || <i style={{ opacity: 0.5 }}>(pending approval)</i>,
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
