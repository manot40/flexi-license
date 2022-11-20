import useSWR from 'swr';
import { useState } from 'react';
import fetcher from 'libs/fetcher';
import { useDebouncedState } from '@mantine/hooks';

import UserModal from './UserModal';
import { AutoTable } from 'components/reusable';
import { Box, Button, Center, Chip, Flex, Input, Pagination, Select, Space } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

export default function UserTable() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useDebouncedState('', 100);
  const [search, setSearch] = useDebouncedState('', 300);

  const { data, isValidating, mutate } = useSWR<Res<User[]>>(
    `/api/v1/user?page=${page}&username=${search}&role=${role}:equals`,
    fetcher
  );

  const updateUser = async (id: User['id'], body: any) => {
    try {
      const res = await fetcher<Res<User>>(`/api/v1/user/${id}`, { method: 'PATCH', body });
      if (res.success) mutate();
    } catch (err: any) {
      showNotification({ color: 'red', title: 'Failed to update user', message: err.message });
    }
  };

  return (
    <Box>
      <Flex gap={12} justify="space-between">
        <Flex gap={12}>
          <Input onChange={({ target }) => setSearch(target.value)} placeholder="Search by name" />
          <Select
            sx={{ width: '128px' }}
            defaultValue=""
            onChange={setRole}
            data={[{ value: '', label: 'All Role' }, ...roleSelectData]}
          />
        </Flex>
        <Box>
          <UserModal onSubmitted={() => mutate()}>
            <Button>Create User</Button>
          </UserModal>
        </Box>
      </Flex>
      <Space h={16} />
      <AutoTable highlightOnHover columns={columns(updateUser)} data={data?.result} isLoading={isValidating} />
      <Space h={16} />
      {data && !!data.result.length && (
        <Center>
          <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
        </Center>
      )}
    </Box>
  );
}

const roleSelectData = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'SALES', label: 'Sales' },
];

const columns = (mutator: (id: string, body: any) => void) => [
  {
    key: 'username',
    title: 'User Name',
  },
  {
    key: 'role',
    title: 'User Role',
    width: 200,
    render: (cell: string, { id }: User) => (
      <Select
        defaultValue={cell}
        data={roleSelectData}
        styles={{ input: { border: 0 } }}
        onChange={(role) => mutator(id, { role })}
      />
    ),
  },
  {
    key: 'isActive',
    title: 'User Status',
    width: 120,
    render: (cell: boolean, row: User) => (
      <Chip onClick={() => mutator(row.id, { isActive: !row.isActive })} checked={cell}>
        {cell ? 'Active' : 'Inactive'}
      </Chip>
    ),
  },
];
