import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { DateRangePicker, type DateRangePickerValue } from '@mantine/dates';
import { Modal, TextInput, NumberInput, Stack, Button, Space } from '@mantine/core';

type LicenseModalProps = {
  opened: boolean;
  onClose: () => void;
  value?: Partial<License> | null;
  onSubmit?: (data: License) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function LicenseModal({ opened, value, onClose, onSubmit }: LicenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [subsRange, setSubsRange] = useState<DateRangePickerValue>([new Date(), new Date()]);

  const form = useForm({
    initialValues: value as License,
    validate: {
      companyId: (val) => (val ? null : 'Company ID is required'),
      maxUser: (val) => (val < 1 ? 'Max user must be greater than 0' : null),
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
      const res = await fetcher<Res<License>>(`/api/v1/license/${value?.id || ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        body,
      });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `License ${t}d` });
        onSubmit?.(res.result);
        onClose?.();
        form.reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} license`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={() => onClose?.()} title={isEdit ? `Edit license data` : 'Create New License'}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput w="100%" label="Company ID" placeholder="ABC123" {...form.getInputProps('companyId')} />
          <NumberInput w="100%" label="Max User" placeholder="" {...form.getInputProps('maxUser')} />
          <DateRangePicker w="100%" label="Subscription Period" value={subsRange} onChange={setSubsRange} />
          <Space />
          <Button disabled loading={loading} type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
