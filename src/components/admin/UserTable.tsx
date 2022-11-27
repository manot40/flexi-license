import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import { useDebouncedState, useDisclosure } from '@mantine/hooks';

import UserForm from './UserForm';
import { showNotification } from '@mantine/notifications';
import { AutoTable, type TableColumn } from 'components/reusable';
import { Stack, Button, Center, Chip, Flex, Group, Input, Pagination, Select, Card, Modal } from '@mantine/core';

export default function UserTable() {
  const [page, setPage] = useState(1);
  const [role, setRole] = useDebouncedState('', 100);
  const [search, setSearch] = useDebouncedState('', 300);

  const [changePass, setChgPass] = useState('');
  const [modal, { toggle }] = useDisclosure(false);

  const { data, isValidating, mutate } = useSWR<Res<User[]>>(
    `/api/v1/admin/user?page=${page}&username=${search}&role=${role}:equals`,
    fetcher
  );

  const updateUser = useCallback(
    async (id: User['id'], body: any) => {
      try {
        const res = await fetcher<Res<User>>(`/api/v1/admin/user/${id}`, { method: 'PATCH', body });
        if (res.success) {
          mutate();
          showNotification({ color: 'green', title: 'Success', message: `User ${res.result.username} data updated` });
        }
      } catch (err: any) {
        showNotification({ color: 'red', title: 'Failed to update user', message: err.message });
      } finally {
        toggle();
        setChgPass('');
      }
    },
    [mutate, toggle]
  );

  const columns = useMemo(
    () =>
      [
        {
          key: 'username',
          title: 'User Name',
        },
        {
          key: 'role',
          title: 'User Role',
          style: { width: 200 },
          render: (cell: string, { id }) => (
            <Select
              defaultValue={cell}
              data={roleSelectData}
              styles={{ input: { border: 0 } }}
              onChange={(role) => updateUser(id, { role })}
            />
          ),
        },
        {
          key: 'isActive',
          title: 'User Status',
          style: { width: 120 },
          render: (cell: boolean, row) => (
            <Chip onClick={() => updateUser(row.id, { isActive: !row.isActive })} checked={cell}>
              {cell ? 'Active' : 'Inactive'}
            </Chip>
          ),
        },
        {
          key: 'id',
          title: 'Action',
          style: { width: 200 },
          render: (cell: string) => (
            <Button variant="light" onClick={() => (toggle(), setChgPass(cell))}>
              Change Pass
            </Button>
          ),
        },
      ] as TableColumn<User>[],
    [updateUser, toggle]
  );

  return (
    <Stack spacing={16}>
      <Flex gap={12} direction={{ base: 'column-reverse', xs: 'initial' }} justify="space-between">
        <Group spacing={8} position="left" noWrap>
          <Input
            placeholder="Search by name"
            w={{ base: '100%', sm: 'auto' }}
            onChange={({ target }) => setSearch(target.value)}
          />
          <Select
            defaultValue=""
            onChange={setRole}
            sx={{ width: '10rem' }}
            data={[{ value: '', label: 'All Role' }, ...roleSelectData]}
          />
        </Group>
        <Button w={{ base: '100%', sm: 'auto' }} onClick={toggle}>
          Create User
        </Button>
        {/* <UserModal onSubmitted={() => mutate()}>
          <Button w={{ base: '100%', sm: 'auto' }}>Create User</Button>
        </UserModal> */}
      </Flex>
      <Card shadow="sm" radius="md">
        <AutoTable highlightOnHover columns={columns} data={data?.result} isLoading={isValidating} />
        {data && !!data.result.length && (
          <Center my={8}>
            <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
          </Center>
        )}
      </Card>
      <Modal
        opened={modal}
        onClose={() => (toggle(), setChgPass(''))}
        title={changePass ? 'Change Password' : 'Create New User'}>
        <UserForm
          onSubmit={changePass ? (b) => updateUser(changePass, b) : undefined}
          passChange={!!changePass}
          onSubmitted={toggle}
        />
      </Modal>
    </Stack>
  );
}

const roleSelectData = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPPORT', label: 'Support' },
  { value: 'SALES', label: 'Sales' },
];
