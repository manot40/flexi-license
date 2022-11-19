import useSWR from 'swr';
import fetcher from 'libs/fetcher';
import { useDebouncedState } from '@mantine/hooks';

import { AutoTable } from './reusable';
import { Box, Button, Chip, Flex, Input, LoadingOverlay, Select, Space } from '@mantine/core';

export default function UsersTable() {
  const [role, setRole] = useDebouncedState('', 100);
  const [search, setSearch] = useDebouncedState('', 300);
  const { data, isValidating } = useSWR<Res<User[]>>(`/api/v1/user?username=${search}&role=${role}:equals`, fetcher);

  const toggleStatus = async (id: User['id']) => {
    console.log(id);
  };

  const columns = [
    { key: 'username', title: 'User Name' },
    { key: 'role', title: 'User Role' },
    {
      key: 'isActive',
      title: 'User Status',
      render: (cell: boolean, row: User) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Chip onClick={() => toggleStatus(row.id)} checked={cell}>
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
            data={[
              { value: '', label: 'All Type' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'SUPPORT', label: 'Support' },
              { value: 'SALES', label: 'Sales' },
            ]}
          />
        </Flex>
        <Box>
          <Button>Create</Button>
        </Box>
      </Flex>
      <Space h={16} />
      <div>
        <LoadingOverlay visible={isValidating} />
        <AutoTable highlightOnHover columns={columns} onClick={(r) => console.log(r)} data={data?.result} />
      </div>
    </Box>
  );
}
