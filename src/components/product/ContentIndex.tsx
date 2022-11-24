import fetcher from 'libs/fetcher';

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useAuth } from 'components/AuthContext';
import { useDebouncedState, useViewportSize } from '@mantine/hooks';

import { IconEdit } from '@tabler/icons';
import { AutoTable } from 'components/reusable';

import ProductForm, { defaultProductData } from './ProductForm';

import {
  Flex,
  Card,
  Input,
  Group,
  Modal,
  Title,
  Stack,
  Button,
  Center,
  Pagination,
  ActionIcon,
  Select,
} from '@mantine/core';

export default function ContentIndex() {
  const { push } = useRouter();
  const { width } = useViewportSize();
  const { checkRole } = useAuth();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useDebouncedState('', 300);
  const [product, setProduct] = useState<Partial<Product> | null>(null);

  const { data, mutate } = useSWR<Res<User[]>>(
    `/api/v1/product?page=${page}&name=${search}&isActive=${status}:equals`,
    fetcher
  );

  const isAdmin = checkRole('ADMIN');

  const renderedColumn = useMemo(() => {
    const cols: any = [...columns];

    if (isAdmin)
      cols.push({
        key: 'id',
        title: 'Action',
        render: (cell: string, row: Product) => (
          <Group noWrap spacing={4} position="left" onClick={(e) => e.stopPropagation()}>
            <ActionIcon color="blue" onClick={() => setProduct(row)}>
              <IconEdit size={16} stroke={1.5} />
            </ActionIcon>
          </Group>
        ),
      });

    return cols;
  }, [isAdmin]);

  return (
    <Stack spacing={32}>
      <Title order={1}>Manage Product</Title>
      {isAdmin && (
        <Modal
          opened={!!product}
          onClose={() => setProduct(null)}
          title={!!product?.id ? `Edit ${product.name} data` : 'Create New Product'}>
          <ProductForm value={product!} onSubmitted={() => (mutate(), setProduct(null))} />
        </Modal>
      )}
      <Card shadow="sm" radius="md" p="lg">
        <Stack spacing={16}>
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
            {isAdmin && <Button onClick={() => setProduct(defaultProductData)}>New Product</Button>}
          </Flex>
          <AutoTable
            highlightOnHover
            data={data?.result}
            useScroll={width <= 768}
            columns={renderedColumn}
            onClick={(row) => push(`/dashboard/product/${row.code}`)}
          />
          {data && !!data.result.length && (
            <Center>
              <Pagination page={page} onChange={setPage} total={data.paginate!.totalPage} />
            </Center>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}

const statusSelectData = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const columns = [
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
];
