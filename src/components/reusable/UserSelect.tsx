import { useState, useMemo } from 'react';
import useSWR from 'swr';

import fetcher from 'libs/fetcher';
import { Select } from '@mantine/core';

type UserSelect = {
  fields?: (keyof User)[];
  valueKey?: keyof User;
  labelKey?: keyof User;
  onChange?: (val: User['id'], user: User) => void;
} & Omit<React.ComponentProps<typeof Select>, 'onChange' | 'data' | 'searchValue' | 'onSearchChange'>;

export default function UserSelect({
  onChange,
  fields = [],
  valueKey = 'id',
  labelKey = 'username',
  searchable = true,
  placeholder = 'Select user',
  ...restProps
}: UserSelect) {
  const [search, setSearch] = useState('');
  const { data } = useSWR<Res<User[]>>(
    `/api/v1/admin/user?username=${search}&fields=${fields.join(',')}&order=username:asc`,
    fetcher
  );

  const users = useMemo(() => {
    if (!data) return [];
    return data.result.map((user) => ({
      label: `${user[labelKey]}`,
      value: `${user[valueKey]}`,
    }));
  }, [data, labelKey, valueKey]);

  return (
    <Select
      {...restProps}
      data={users}
      searchValue={search}
      searchable={searchable}
      placeholder={placeholder}
      onSearchChange={setSearch}
      onChange={(val) => onChange?.(val!, data?.result.find((c) => c.id === val)!)}
    />
  );
}
