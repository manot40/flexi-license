import { useState, useMemo } from 'react';
import useSWR from 'swr';

import fetcher from 'libs/fetcher';
import { Select } from '@mantine/core';

type CompanySelect = {
  onChange?: (val: Company['id'], company: Company) => void;
} & Omit<React.ComponentProps<typeof Select>, 'onChange' | 'data' | 'searchValue' | 'onSearchChange'>;

export default function CompanySelect({ onChange, searchable = true, ...props }: CompanySelect) {
  const [search, setSearch] = useState('');
  const { data } = useSWR<Res<Company[]>>(`/api/v1/company?name=${search}&fields=name,id`, fetcher);

  const companies = useMemo(() => {
    if (!data) return [];
    return data.result.map((company) => ({
      label: company.name,
      value: company.id,
    }));
  }, [data]);

  return (
    <Select
      {...props}
      label="Company"
      data={companies}
      searchValue={search}
      searchable={searchable}
      onSearchChange={setSearch}
      placeholder="Select company"
      onChange={(val) => onChange?.(val!, data?.result.find((c) => c.id === val)!)}
    />
  );
}
