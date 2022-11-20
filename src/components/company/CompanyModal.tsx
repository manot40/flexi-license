import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Modal, TextInput, Stack, Button, Space } from '@mantine/core';

type CompanyModalProps = {
  opened: boolean;
  onClose: () => void;
  value?: Partial<Company> | null;
  onSubmit?: (data: Company) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function CompanyModal({ opened, value, onClose, onSubmit }: CompanyModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: value as Company,
    validate: {
      name: (value) => (value ? null : 'Name is required'),
      contactName: (value) => (value ? null : 'Contact name is required'),
      contactNumber: (value) => (value ? null : 'Contact number is required'),
    },
  });

  useEffect(() => {
    if (value) {
      const { id, updatedAt, createdAt, createdBy, updatedBy, ...data } = value;
      form.setValues(data);
    } else {
      form.reset();
    }
    // eslint-disable-next-line
  }, [value]);

  const isEdit = !!value?.id;

  const handleSubmit = async (body: typeof form.values) => {
    setLoading(true);
    const t = isEdit ? 'update' : 'create';
    try {
      const res = await fetcher<Res<Company>>(`/api/v1/company/${value?.id || ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        body,
      });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `Company ${body.name} ${t}d` });
        onSubmit?.(res.result);
        onClose?.();
        form.reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} company`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => onClose?.()}
      title={isEdit ? `Edit ${value.name} data` : 'Create New Company'}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput w="100%" label="Name" placeholder="Acme. Inc." {...form.getInputProps('name')} />
          <TextInput w="100%" label="Contact Person" placeholder="John Doe" {...form.getInputProps('contactName')} />
          <TextInput
            w="100%"
            label="Contact Number"
            placeholder="0123456789"
            {...form.getInputProps('contactNumber')}
          />
          <Space />
          <Button loading={loading} type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
