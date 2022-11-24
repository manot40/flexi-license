import { useState, cloneElement, isValidElement } from 'react';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Modal, Select, TextInput, PasswordInput, Flex, Stack, Button, Space } from '@mantine/core';
import fetcher from 'libs/fetcher';

type UserModalProps = {
  onSubmitted?: (data: User) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function UserModal({ children, onSubmitted }: UserModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      retryPass: '',
      role: 'SALES',
    },
    validate: {
      username: (value) => (value.length < 6 ? 'Username must be at least 6 characters long' : null),
      password: (value) => (value.length < 6 ? 'Password must be at least 6 characters long' : null),
      retryPass: (value, { password }) => (value !== password ? 'Passwords do not match' : null),
    },
  });

  const handleSubmit = async (data: typeof form.values) => {
    setLoading(true);
    try {
      const { retryPass, ...body } = data;
      const res = await fetcher<Res<User>>('/api/v1/user', { method: 'POST', body });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `User ${body.username} created` });
        onSubmitted?.(res.result);
        setOpen(false);
        form.reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: 'Failed to create user', message: err.message });
    }
    setLoading(false);
  };

  return (
    <>
      {isValidElement(children) ? renderTrigger(children, setOpen) : null}
      <Modal title="Create New User" opened={open} onClose={() => setOpen(false)}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Flex gap={12} justify="center">
              <TextInput w={'100%'} label="User Name" placeholder="User Name" {...form.getInputProps('username')} />
              <Select
                label="User Role"
                sx={{ width: '200px' }}
                data={[
                  { value: 'SALES', label: 'Sales' },
                  { value: 'ADMIN', label: 'Admin' },
                  { value: 'SUPPORT', label: 'Support' },
                ]}
                {...form.getInputProps('role')}
              />
            </Flex>
            <PasswordInput w={'100%'} label="Password" placeholder="Password" {...form.getInputProps('password')} />
            <PasswordInput
              w={'100%'}
              label="Confirm Password"
              placeholder="Confirm Password"
              {...form.getInputProps('retryPass')}
            />
            <Space />
            <Button loading={loading} type="submit">
              Submit
            </Button>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

const renderTrigger = (child: React.ReactElement, mutator: (v: boolean) => void) =>
  cloneElement(child, {
    onClick: (e: any) => (child.props.onClick?.(e), mutator(true)),
  });
