import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Modal, TextInput, Stack, Button, Space, Textarea, Switch, Group } from '@mantine/core';

type ProductModalProps = {
  opened: boolean;
  onClose: () => void;
  value?: Partial<Product> | null;
  onSubmitted?: (data: Product) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ProductModal({ opened, value, onClose, onSubmitted }: ProductModalProps) {
  const [loading, setLoading] = useState(false);

  const { setValues, values, reset, getInputProps, onSubmit } = useForm({
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

  const isEdit = !!value?.id;

  const handleSubmit = async (body: Product) => {
    setLoading(true);
    const t = isEdit ? 'update' : 'create';
    try {
      console.log(body);
      const res = await fetcher<Res<Product>>(`/api/v1/product/${value?.id || ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        body,
      });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `Product ${body.name} ${t}d` });
        onSubmitted?.(res.result);
        onClose?.();
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} product`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => (reset(), onClose?.())}
      title={isEdit ? `Edit ${value.name} data` : 'Create New Product'}>
      <form onSubmit={onSubmit(handleSubmit)}>
        <Stack>
          <Group noWrap>
            <TextInput w="100%" label="Product Code" placeholder="ABC123" {...getInputProps('code')} />
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
    </Modal>
  );
}

export const defaultProductData = {
  id: '',
  code: '',
  name: '',
  isActive: true,
  description: '',
} as Partial<Product>;
