import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useAuth } from 'components/AuthContext';
import { useDebouncedState, useViewportSize } from '@mantine/hooks';

import { IconCertificate2, IconEdit } from '@tabler/icons';
import { AutoTable } from 'components/reusable';
import CompanyForm, { defaultCompanyData } from './CompanyForm';
import {
  Flex,
  Card,
  Input,
  Group,
  Modal,
  Title,
  Stack,
  Button,
  Center,
  Pagination,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { LicenseForm } from 'components/license';

export default function ContentIndex() {
  const { push, query } = useRouter();
  const { width } = useViewportSize();
  const { checkRole } = useAuth();

  const [isLicense, setIsLicense] = useState(false);
  const [page, setPage] = useState(+(query.page || 1));
  const [search, setSearch] = useDebouncedState(query.name || '', 300);
  const [company, setCompany] = useState<Partial<Company> | null>(null);

  const { data, mutate } = useSWR<Res<User[]>>(`/api/v1/company?page=${page}&name=${search}`, fetcher);

  const isSales = checkRole('SALES');

  const renderedColumn = useMemo(() => {
    const cols: any = [...columns];

    if (isSales)
      cols.push({
        key: 'id',
        title: 'Action',
        render: (cell: string, row: Company) => (
          <Group noWrap spacing={4} position="left" onClick={(e) => e.stopPropagation()}>
            <ActionIcon color="blue" onClick={() => setCompany(row)}>
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Group>
        ),
      });

    return cols;
  }, [isSales]);

  return (
    <Stack spacing={32}>
      <Title order={1}>Manage Company</Title>
      {isSales && (
        <Modal
          opened={!!company || isLicense}
          onClose={() => (setCompany(null), setIsLicense(false))}
          title={!!company?.id ? `Edit ${company.name} data` : `Create New ${isLicense ? 'License' : 'Company'}`}>
          {isLicense ? (
            <LicenseForm onSubmitted={() => setIsLicense(false)} />
          ) : (
            <CompanyForm value={company!} onSubmitted={() => (mutate(), setCompany(null))} />
          )}
        </Modal>
      )}
      <Card shadow="sm" radius="md" p="lg">
        <Stack spacing={16}>
          <Flex gap={12} direction={{ base: 'column', xs: 'initial' }} justify="space-between">
            <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by name" />
            {isSales && (
              <Group spacing={8} position="right" noWrap>
                <Tooltip withArrow label="Request License">
                  <Button variant="subtle" onClick={() => setIsLicense(true)}>
                    <IconCertificate2 stroke={1.66} />
                  </Button>
                </Tooltip>
                <Button onClick={() => setCompany(defaultCompanyData)}>New Company</Button>
              </Group>
            )}
          </Flex>
          <AutoTable
            highlightOnHover
            data={data?.result}
            useScroll={width <= 768}
            columns={renderedColumn}
            onClick={(row) => push(`/dashboard/company/${row.id}`)}
          />
          {data && !!data.result.length && (
            <Center>
              <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
            </Center>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

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
    style: { width: 160 },
  },
  {
    key: 'updatedAt',
    title: 'Last Update',
    style: { width: 180 },
    render: (cell: string, row: Company) =>
      `${Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell))} (${
        row.updatedBy
      })`,
  },
];
