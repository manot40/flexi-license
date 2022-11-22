import { useState, useMemo } from 'react';
import useSWR from 'swr';

import fetcher from 'libs/fetcher';
import { Select } from '@mantine/core';

type ProductSelect = {
  fields?: (keyof Product)[];
  valueKey?: keyof Product;
  labelKey?: keyof Product;
  onChange?: (val: Product['id'], product: Product) => void;
} & Omit<React.ComponentProps<typeof Select>, 'onChange' | 'data' | 'searchValue' | 'onSearchChange'>;

export default function ProductSelect({
  onChange,
  fields = [],
  searchable = true,
  valueKey = 'id',
  labelKey = 'name',
  placeholder = 'Select product',
  ...restProps
}: ProductSelect) {
  const [search, setSearch] = useState('');
  const { data } = useSWR<Res<Product[]>>(
    `/api/v1/product?name=${search}&fields=${fields.join(',')}&order=name:asc`,
    fetcher
  );

  const product = useMemo(() => {
    if (!data) return [];
    return data.result.map((product) => ({
      label: `${product[labelKey]} (${product.code})`,
      value: `${product[valueKey]}`,
    }));
  }, [data, valueKey, labelKey]);

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
