import fetcher from 'libs/fetcher';

import { useState } from 'react';
import { useForm } from '@mantine/form';

import { UserSelect } from 'components/reusable';
import { Button, Space, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

type Props = {
  onSubmitted?: () => void;
} & Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export default function ApitokenForm({ onSubmitted, ...restProps }: Props) {
  const [loading, setLoading] = useState(false);

  const { getInputProps, onSubmit, reset } = useForm({
    initialValues: {
      username: '',
    },
    validate: {
      username: (val) => !val && 'User is required',
    },
  });

  const handleSubmit = async (body: any) => {
    try {
      setLoading(true);
      const res = await fetcher<Res<ApiToken>>(`/api/v1/admin/apitoken`, { method: 'POST', body });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `Token Created Successfully` });
        onSubmitted?.();
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: 'Failed create token', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form {...restProps} onSubmit={onSubmit(handleSubmit)}>
      <Stack>
        <UserSelect w="100%" label="Logged user" valueKey="username" {...getInputProps('username')} />
        <Space />
        <Button loading={loading} type="submit">
          Create Token
        </Button>
      </Stack>
    </form>
  );
}
