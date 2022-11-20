import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useState } from 'react';
import { useAuth } from 'components/AuthContext';
import { useDebouncedState } from '@mantine/hooks';

import CompanyModal from './CompanyModal';
import { AutoTable } from 'components/reusable';
import { Box, Button, Center, Flex, Input, Pagination, Space, Title } from '@mantine/core';

export default function UserTable() {
  const { checkRole } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useDebouncedState('', 300);
  const [company, setCompany] = useState<Partial<Company>>();

  const isSales = checkRole('SALES');
  const { data, isValidating, mutate } = useSWR<Res<User[]>>(`/api/v1/company?page=${page}&name=${search}`, fetcher);

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
        <Title size={18} order={2}>
          Manage Company
        </Title>
        <Space h={12} />

        <Flex gap={12}>
          <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by name" />
          {isSales && <Button onClick={() => setCompany(defaultData)}>New Company</Button>}
        </Flex>
        <Space h={16} />
        <AutoTable
          highlightOnHover
          columns={columns}
          data={data?.result}
          isLoading={isValidating}
          onClick={isSales ? setCompany : undefined}
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
