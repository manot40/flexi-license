import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from 'components/AuthContext';
import { useDebouncedState, useViewportSize } from '@mantine/hooks';

import ProductModal, { defaultProductData } from './ProductModal';
import { AutoTable, ConfirmPop } from 'components/reusable';
import { Box, Button, Center, Flex, Input, Pagination, Space, Group, ActionIcon, Select } from '@mantine/core';

import { IconTrash, IconEdit } from '@tabler/icons';

export default function ProductTable() {
  const { push } = useRouter();
  const { checkRole } = useAuth();
  const { width } = useViewportSize();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useDebouncedState('', 300);
  const [product, setProduct] = useState<Partial<Product>>();

  const isSales = checkRole('SALES');
  const { data, isValidating, mutate } = useSWR<Res<User[]>>(
    `/api/v1/product?page=${page}&name=${search}&isActive=${status}:equals`,
    fetcher
  );

  const handleDelete = async (id: string) => console.log(id);

  return (
    <>
      {isSales && (
        <ProductModal
          opened={!!product}
          onClose={setProduct as () => undefined}
          value={product}
          onSubmit={() => mutate()}
        />
      )}
      <Box>
        <Flex gap={12} direction={{ base: 'column', xs: 'initial' }} justify="space-between">
          <Group spacing={8} position="left" noWrap>
            <Input
              placeholder="Search by name"
              w={{ base: '100%', sm: 'auto' }}
              onChange={({ target }) => setSearch(target.value)}
            />
            <Select
              defaultValue=""
              sx={{ width: '10rem' }}
              onChange={(v) => setStatus(v!)}
              data={[{ value: '', label: 'All Type' }, ...statusSelectData]}
            />
          </Group>
          {isSales && <Button onClick={() => setProduct(defaultProductData)}>New Product</Button>}
        </Flex>
        <Space h={16} />
        <AutoTable
          highlightOnHover
          data={data?.result}
          useScroll={width <= 768}
          isLoading={isValidating}
          columns={columns(setProduct, handleDelete)}
          onClick={(row) => push(`/dashboard/product/${row.code}`)}
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

const statusSelectData = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const columns = (mutator: any, deleteHandler: any) => [
  {
    key: 'name',
    title: 'Product Name',
    render: (val: string, prod: Product) => `${val} (${prod.code})`,
  },
  {
    key: 'description',
    title: 'Description',
    render: (val: string) => val || <i style={{ opacity: 0.5 }}>(No description)</i>,
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
    key: 'isActive',
    title: 'Status',
    width: 80,
    render: (cell: boolean) => (cell ? 'Active' : 'Inactive'),
  },
  {
    key: 'id',
    title: 'Action',
    render: (cell: string, row: Company) => (
      <Group spacing={4} position="left" onClick={(e) => e.stopPropagation()}>
        <ActionIcon color="blue" onClick={() => mutator(row)}>
          <IconEdit size={16} stroke={1.5} />
        </ActionIcon>
        <ConfirmPop color="red" onConfirm={() => deleteHandler(cell)}>
          <ActionIcon color="red">
            <IconTrash size={16} />
          </ActionIcon>
        </ConfirmPop>
      </Group>
    ),
  },
];
