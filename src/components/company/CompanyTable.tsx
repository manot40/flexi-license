import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';
import { useDebouncedState, useViewportSize } from '@mantine/hooks';

import CompanyModal from './CompanyModal';
import { AutoTable, ConfirmPop } from 'components/reusable';
import { Box, Button, Center, Flex, Input, Pagination, Space } from '@mantine/core';

import { IconTrash, IconEdit } from '@tabler/icons';

export default function UserTable() {
  const { push } = useRouter();
  const { checkRole } = useAuth();
  const { width } = useViewportSize();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useDebouncedState('', 300);
  const [company, setCompany] = useState<Partial<Company>>();

  const isSales = checkRole('SALES');
  const { data, isValidating, mutate } = useSWR<Res<User[]>>(`/api/v1/company?page=${page}&name=${search}`, fetcher);

  const handleDelete = async (id: string) => console.log(id);

  return (
    <>
      {isSales && (
        <CompanyModal
          opened={!!company}
          onClose={setCompany as () => undefined}
          value={company}
          onSubmit={() => mutate()}
        />
      )}
      <Box>
        <Flex gap={12} justify="space-between">
          <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by name" />
          {isSales && <Button onClick={() => setCompany(defaultData)}>New Company</Button>}
        </Flex>
        <Space h={16} />
        <AutoTable
          highlightOnHover
          data={data?.result}
          useScroll={width <= 768}
          isLoading={isValidating}
          columns={columns(setCompany, handleDelete)}
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

const defaultData = {
  id: '',
  name: '',
  contactName: '',
  contactNumber: '',
} as Partial<Company>;

const columns = (mutator: any, deleteHandler: any) => [
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
  {
    key: 'id',
    title: 'Action',
    render: (cell: string, row: Company) => (
      <Flex onClick={(e) => e.stopPropagation()} gap={8}>
        <Button compact variant="light" onClick={() => mutator(row)}>
          <IconEdit size={16} />
        </Button>
        <ConfirmPop color="red" onConfirm={() => deleteHandler(cell)}>
          <Button compact color="red">
            <IconTrash size={16} />
          </Button>
        </ConfirmPop>
      </Flex>
    ),
  },
];
