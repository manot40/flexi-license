import { useState, useMemo } from 'react';
import useSWR from 'swr';

import fetcher from 'libs/fetcher';
import { Select } from '@mantine/core';

type ProductSelect = {
  url?: string;
  hideCode?: boolean;
  fields?: (keyof Product)[];
  valueKey?: keyof Product;
  labelKey?: keyof Product;
  onChange?: (val: Product['id'], product: Product) => void;
} & Omit<React.ComponentProps<typeof Select>, 'onChange' | 'data' | 'searchValue' | 'onSearchChange'>;

export default function ProductSelect({
  onChange,
  hideCode,
  url = '/api/v1/product',
  fields = ['id', 'name', 'code'],
  searchable = true,
  valueKey = 'id',
  labelKey = 'name',
  placeholder = 'Select product',
  ...restProps
}: ProductSelect) {
  const [search, setSearch] = useState('');
  const { data } = useSWR<Res<Product[]>>(`${url}?name=${search}&fields=${fields.join(',')}&order=name:asc`, fetcher);

  const product = useMemo(() => {
    if (!data) return [];
    return data.result.map((product) => ({
      label: product[labelKey] + (!hideCode ? ` (${product.code})` : ''),
      value: `${product[valueKey]}`,
    }));
  }, [data, valueKey, labelKey, hideCode]);

  return (
    <Select
      {...restProps}
      data={product}
      searchValue={search}
      searchable={searchable}
      placeholder={placeholder}
      onSearchChange={setSearch}
      onChange={(val) => onChange?.(val!, data?.result.find((c) => c.id === val)!)}
    />
  );
}
