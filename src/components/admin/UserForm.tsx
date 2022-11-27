import { useState } from 'react';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Select, TextInput, PasswordInput, Flex, Stack, Button, Space } from '@mantine/core';
import fetcher from 'libs/fetcher';

type UserInputForm = {
  username: string;
  password: string;
  retryPass: string;
  role: string;
};

type UserFormProps = {
  passChange?: boolean;
  onSubmit?: (data: UserInputForm) => void;
  onSubmitted?: (data: User) => void;
} & Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit'>;

export default function UserModal({ onSubmitted, onSubmit: _onSubmit, passChange, ...restProps }: UserFormProps) {
  const [loading, setLoading] = useState(false);

  const { onSubmit, getInputProps, reset } = useForm({
    initialValues: {
      username: '',
      password: '',
      retryPass: '',
      role: 'SALES',
    },
    validate: {
      username: (v) => !passChange && v.length < 6 && 'Username must be at least 6 characters long',
      password: (v) => v.length < 6 && 'Password must be at least 6 characters long',
      retryPass: (v, { password }) => v !== password && 'Passwords do not match',
    },
  });

  const handleSubmit = async (data: UserInputForm) => {
    setLoading(true);
    try {
      const { retryPass, ...body } = data;
      const res = await fetcher<Res<User>>('/api/v1/admin/user', { method: 'POST', body });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `User ${body.username} created` });
        onSubmitted?.(res.result);
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: 'Failed to create user', message: err.message });
    }
    setLoading(false);
  };

  return (
    <form {...restProps} onSubmit={onSubmit(_onSubmit || handleSubmit)}>
      <Stack>
        {!passChange && (
          <Flex gap={12} justify="center">
            <TextInput w={'100%'} label="User Name" placeholder="User Name" {...getInputProps('username')} />
            <Select
              label="User Role"
              sx={{ width: '200px' }}
              data={[
                { value: 'SALES', label: 'Sales' },
                { value: 'ADMIN', label: 'Admin' },
                { value: 'SUPPORT', label: 'Support' },
              ]}
              {...getInputProps('role')}
            />
          </Flex>
        )}
        <PasswordInput w={'100%'} label="Password" placeholder="Password" {...getInputProps('password')} />
        <PasswordInput
          w={'100%'}
          label="Confirm Password"
          placeholder="Confirm Password"
          {...getInputProps('retryPass')}
        />
        <Space />
        <Button loading={loading} type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}
