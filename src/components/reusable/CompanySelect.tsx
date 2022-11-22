import { useState, useMemo } from 'react';
import useSWR from 'swr';

import fetcher from 'libs/fetcher';
import { Select } from '@mantine/core';

type CompanySelect = {
  fields?: (keyof Company)[];
  valueKey?: keyof Company;
  labelKey?: keyof Company;
  onChange?: (val: Company['id'], company: Company) => void;
} & Omit<React.ComponentProps<typeof Select>, 'onChange' | 'data' | 'searchValue' | 'onSearchChange'>;

export default function CompanySelect({
  onChange,
  fields = [],
  valueKey = 'id',
  labelKey = 'name',
  searchable = true,
  placeholder = 'Select company',
  ...restProps
}: CompanySelect) {
  const [search, setSearch] = useState('');
  const { data } = useSWR<Res<Company[]>>(
    `/api/v1/company?name=${search}&fields=${fields.join(',')}&order=name:asc`,
    fetcher
  );

  const companies = useMemo(() => {
    if (!data) return [];
    return data.result.map((company) => ({
      label: `${company[labelKey]}`,
      value: `${company[valueKey]}`,
    }));
  }, [data, labelKey, valueKey]);

  return (
    <Select
      {...restProps}
      data={companies}
      searchValue={search}
      searchable={searchable}
      placeholder={placeholder}
      onSearchChange={setSearch}
      onChange={(val) => onChange?.(val!, data?.result.find((c) => c.id === val)!)}
    />
  );
}
