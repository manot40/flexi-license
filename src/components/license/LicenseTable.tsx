import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';
import { useDebouncedState, useViewportSize } from '@mantine/hooks';

import LicenseModal from './LicenseModal';
import { AutoTable, ConfirmPop } from 'components/reusable';
import { Box, Button, Center, Flex, Input, Pagination, Space } from '@mantine/core';

import { IconTrash, IconEdit } from '@tabler/icons';

export default function LicenseTable() {
  const { push } = useRouter();
  const { checkRole } = useAuth();
  const { width } = useViewportSize();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useDebouncedState('', 300);
  const [license, setLicense] = useState<Partial<License>>();

  const isSales = checkRole('SALES');
  const { data, isValidating, mutate } = useSWR<Res<User[]>>(
    `/api/v1/license?page=${page}&companyId=${search}`,
    fetcher
  );

  const handleDelete = async (id: string) => console.log(id);

  return (
    <>
      {isSales && (
        <LicenseModal
          opened={!!license}
          onClose={setLicense as () => undefined}
          value={license}
          onSubmit={() => mutate()}
        />
      )}
      <Box>
        <Flex gap={12} justify="space-between">
          <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by company ID" />
          {isSales && <Button onClick={() => setLicense(defaultData)}>New License</Button>}
        </Flex>
        <Space h={16} />
        <AutoTable
          highlightOnHover
          data={data?.result}
          useScroll={width <= 768}
          isLoading={isValidating}
          columns={columns(setLicense, handleDelete)}
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

const defaultData = {
  id: '',
  name: '',
  contactName: '',
  contactNumber: '',
} as Partial<License>;

const columns = (mutator: any, deleteHandler: any) => [
  {
    key: 'companyId',
    title: 'Company ID',
  },
  {
    key: 'maxUser',
    title: 'Max User',
  },
  {
    key: 'subscriptionStart',
    title: 'Subscription Start',
    width: 180,
    render: (cell: string) =>
      Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
  },
  {
    key: 'subscriptionStart',
    title: 'Subscription End',
    width: 180,
    render: (cell: string) =>
      Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(cell)),
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
  // {
  //   key: 'id',
  //   title: 'Action',
  //   render: (cell: string, row: Company) => (
  //     <Flex onClick={(e) => e.stopPropagation()} gap={8}>
  //       <Button compact variant="light" onClick={() => mutator(row)}>
  //         <IconEdit size={16} />
  //       </Button>
  //       <ConfirmPop color="red" onConfirm={() => deleteHandler(cell)}>
  //         <Button compact color="red">
  //           <IconTrash size={16} />
  //         </Button>
  //       </ConfirmPop>
  //     </Flex>
  //   ),
  // },
];
