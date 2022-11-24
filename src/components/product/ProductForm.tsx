import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { useAuth } from 'components/AuthContext';
import { showNotification } from '@mantine/notifications';
import { Button, Group, Space, Stack, Switch, Textarea, TextInput } from '@mantine/core';

type ProductFormProps = {
  value?: Partial<Product>;
  onSubmitted?: (data: Product) => void;
} & Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;

export default function ProductForm({ value, onSubmitted, ...others }: ProductFormProps) {
  const { checkRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const { values, setValues, reset, getInputProps, onSubmit } = useForm({
    initialValues: (value as Product) || defaultProductData,
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      code: (value) => (value ? null : 'Item code is required'),
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

  const isAdmin = checkRole('ADMIN');

  const handleSubmit = async (body: Product) => {
    if (!isAdmin) return showNotification({ message: 'You are not authorized to do this' });

    setLoading(true);
    const t = !!value?.id ? 'update' : 'create';
    try {
      const res = await fetcher<Res<Product>>(`/api/v1/product/${value?.id || ''}`, {
        method: !!value?.id ? 'PUT' : 'POST',
        body,
      });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `Product ${body.name} ${t}d` });
        onSubmitted?.(res.result);
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} product`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <form {...others} onSubmit={onSubmit(handleSubmit)}>
      <Stack>
        <Group noWrap>
          <TextInput
            w="100%"
            label="Product Code"
            placeholder="ABC123"
            disabled={!!value?.code}
            {...getInputProps('code')}
          />
          <Switch
            w={180}
            label={values.isActive ? 'Active' : 'Inactive'}
            {...getInputProps('isActive', { type: 'checkbox' })}
          />
        </Group>
        <TextInput w="100%" label="Product Name" placeholder="Flexi Cloud" {...getInputProps('name')} />
        <Textarea w="100%" label="Description" placeholder="" {...getInputProps('description')} />
        <Space />
        <Button loading={loading} type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}

export const defaultProductData = {
  id: '',
  name: '',
  contactName: '',
  contactNumber: '',
} as Partial<Product>;
