import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useCallback, useMemo, useState } from 'react';
import { useDebouncedState, useDisclosure, useClipboard } from '@mantine/hooks';

import ApitokenForm from './ApitokenForm';
import { IconCopy, IconTrash } from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { AutoTable, ConfirmPop, type TableColumn } from 'components/reusable';
import {
  Chip,
  Flex,
  Card,
  Group,
  Modal,
  Input,
  Stack,
  Button,
  Center,
  Select,
  Tooltip,
  ActionIcon,
  Pagination,
  PasswordInput,
} from '@mantine/core';

export default function ApitokenTable() {
  const { copy, copied } = useClipboard({ timeout: 600 });

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [modal, { toggle }] = useDisclosure(false);
  const [search, setSearch] = useDebouncedState('', 300);

  const { data, mutate } = useSWR<Res<User[]>>(
    `/api/v1/admin/apitoken?page=${page}&username=${search}&isActive=${status || ''}:equals`,
    fetcher
  );

  const updateToken = useCallback(
    async (id: User['id'], body: any) => {
      try {
        const res = await fetcher<Res<User>>(`/api/v1/admin/apitoken/${id}`, { method: 'PATCH', body });
        if (res.success) mutate();
      } catch (err: any) {
        showNotification({ color: 'red', title: 'Failed to update user', message: err.message });
      }
    },
    [mutate]
  );

  const columns = useMemo(() => {
    return [
      {
        key: 'token',
        title: 'API Token',
        style: { minWidth: 200 },
        render: (token: string) => (
          <PasswordInput readOnly value={token} styles={{ input: { border: 0 } }} onFocus={(e) => e.target.select()} />
        ),
      },
      {
        key: 'username',
        title: 'User',
      },
      {
        key: 'isActive',
        title: 'Status',
        style: { width: 120 },
        render: (cell, row) => (
          <Chip onClick={() => updateToken(row.id, { isActive: !cell })} checked={cell}>
            {cell ? 'Active' : 'Inactive'}
          </Chip>
        ),
      },
      {
        key: 'id',
        title: 'Action',
        render: (_, row) => (
          <Group noWrap spacing={4} position="left" onClick={(e) => e.stopPropagation()}>
            <Tooltip withArrow label={copied ? 'Copied' : 'Copy Token'}>
              <ActionIcon color="blue" onClick={() => copy(row.token)}>
                <IconCopy size={16} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
            <ConfirmPop color="red">
              <ActionIcon color="red" onClick={() => {}}>
                <IconTrash size={16} stroke={1.5} />
              </ActionIcon>
            </ConfirmPop>
          </Group>
        ),
      },
    ] as TableColumn<ApiToken>[];
    // eslint-disable-next-line
  }, [updateToken, copied]);

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
            sx={{ width: '10rem' }}
            onChange={setStatus as any}
            data={[{ value: '', label: 'All Status' }, ...statusSelectData]}
          />
        </Group>
        <Button onClick={toggle} w={{ base: '100%', sm: 'auto' }}>
          Create Token
        </Button>
      </Flex>
      <Card shadow="sm" radius="md">
        <AutoTable columns={columns} data={data?.result} />
        {data && !!data.result.length && (
          <Center my={8}>
            <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
          </Center>
        )}
      </Card>
      <Modal title="Create API Token" opened={modal} onClose={toggle}>
        <ApitokenForm onSubmitted={() => (mutate(), toggle())} />
      </Modal>
    </Stack>
  );
}

const statusSelectData = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
