import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Button, Space, Stack, TextInput } from '@mantine/core';

type CompanyFormProps = {
  value?: Partial<Company>;
  onSubmitted?: (data: Company) => void;
} & Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;

export default function CompanyForm({ value, onSubmitted, ...others }: CompanyFormProps) {
  const [loading, setLoading] = useState(false);

  const { setValues, reset, getInputProps, onSubmit } = useForm({
    initialValues: (value as Company) || defaultCompanyData,
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      contactName: (value) => (value ? null : 'Contact name is required'),
      contactNumber: (value) => (value ? null : 'Contact number is required'),
    },
  });

  useEffect(() => {
    if (value) {
      const { id, updatedAt, createdAt, createdBy, updatedBy, ...data } = value;
      setValues(data);
    } else {
      reset();
    }
    // eslint-disable-next-line
  }, [value]);

  const handleSubmit = async (body: Company) => {
    setLoading(true);
    const t = !!value?.id ? 'update' : 'create';
    try {
      const res = await fetcher<Res<Company>>(`/api/v1/company/${value?.id || ''}`, {
        method: !!value?.id ? 'PUT' : 'POST',
        body,
      });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `Company ${body.name} ${t}d` });
        onSubmitted?.(res.result);
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} company`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <form {...others} onSubmit={onSubmit(handleSubmit)}>
      <Stack>
        <TextInput w="100%" label="Name" placeholder="Acme. Inc." {...getInputProps('name')} />
        <TextInput w="100%" label="Contact Person" placeholder="John Doe" {...getInputProps('contactName')} />
        <TextInput w="100%" label="Contact Number" placeholder="0123456789" {...getInputProps('contactNumber')} />
        <Space />
        <Button loading={loading} type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}

export const defaultCompanyData = {
  id: '',
  name: '',
  contactName: '',
  contactNumber: '',
} as Partial<Company>;
