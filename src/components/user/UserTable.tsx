import useSWR from 'swr';
import fetcher from 'libs/fetcher';
import { useDebouncedState } from '@mantine/hooks';

import UserModal from './UserModal';
import { AutoTable } from 'components/reusable';
import { Box, Button, Chip, Flex, Input, Select, Space } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

export default function UserTable() {
  const [role, setRole] = useDebouncedState('', 100);
  const [search, setSearch] = useDebouncedState('', 300);

  const { data, isValidating, mutate } = useSWR<Res<User[]>>(
    `/api/v1/user?username=${search}&role=${role}:equals`,
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

  const columns = [
    {
      key: 'username',
      title: 'User Name',
      render: (cell: string, { id }: User) => (
        <Input defaultValue={cell} styles={ghostInput} onBlur={(e) => updateUser(id, { username: e.target.value })} />
      ),
    },
    {
      key: 'role',
      title: 'User Role',
      render: (cell: string, { id }: User) => (
        <Select
          defaultValue={cell}
          styles={ghostInput}
          data={roleSelectData}
          onChange={(role) => updateUser(id, { role })}
        />
      ),
    },
    {
      key: 'isActive',
      title: 'User Status',
      render: (cell: boolean, row: User) => (
        <div style={{ width: 100 }}>
          <Chip onClick={() => updateUser(row.id, { isActive: !row.isActive })} checked={cell}>
            {cell ? 'Active' : 'Inactive'}
          </Chip>
        </div>
      ),
    },
  ];

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
      <AutoTable highlightOnHover columns={columns} data={data?.result} isLoading={isValidating} />
    </Box>
  );
}

const ghostInput = { input: { border: 0 } };

const roleSelectData = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'SALES', label: 'Sales' },
];
