import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useDebouncedState, useViewportSize } from '@mantine/hooks';

import CompanyForm from './CompanyForm';
import { AutoTable, ConfirmPop } from 'components/reusable';
import { Box, Button, Center, Flex, Input, Pagination, Space, Group, ActionIcon, Modal } from '@mantine/core';

import { IconTrash, IconEdit } from '@tabler/icons';

type CompanyTableProps = {
  checkRole: (role: User['role'] | User['role'][]) => boolean;
};

export default function CompanyTable({ checkRole }: CompanyTableProps) {
  const { push } = useRouter();
  const { width } = useViewportSize();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useDebouncedState('', 300);
  const [company, setCompany] = useState<Partial<Company> | null>(null);

  const { data, isValidating, mutate } = useSWR<Res<User[]>>(`/api/v1/company?page=${page}&name=${search}`, fetcher);

  const handleDelete = async (id: string) => console.log(id);

  const isSales = checkRole('SALES');

  const renderedColumn = useMemo(() => {
    const cols: any = [...columns];

    if (isSales)
      cols.push({
        key: 'id',
        title: 'Action',
        render: (cell: string, row: Company) => (
          <Group spacing={4} position="left" onClick={(e) => e.stopPropagation()}>
            <ActionIcon color="blue" onClick={() => setCompany(row)}>
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
            <ConfirmPop color="red" onConfirm={() => handleDelete(cell)}>
              <ActionIcon color="red">
                <IconTrash size={16} />
              </ActionIcon>
            </ConfirmPop>
          </Group>
        ),
      });

    return cols;
  }, [isSales]);

  return (
    <>
      {isSales && (
        <Modal
          opened={!!company}
          onClose={() => setCompany(null)}
          title={!!company?.id ? `Edit ${company.name} data` : 'Create New Company'}>
          <CompanyForm value={company!} onSubmitted={() => (mutate(), setCompany(null))} />
        </Modal>
      )}
      <Box>
        <Flex gap={12} direction={{ base: 'column-reverse', xs: 'initial' }} justify="space-between">
          <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by name" />
          {isSales && (
            <Group spacing={6} position="right">
              <Button onClick={() => setCompany(null)}>New Company</Button>
            </Group>
          )}
        </Flex>
        <Space h={16} />
        <AutoTable
          highlightOnHover
          data={data?.result}
          useScroll={width <= 768}
          isLoading={isValidating}
          columns={renderedColumn}
          onClick={(row) => push(`/dashboard/company/${row.id}`)}
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
