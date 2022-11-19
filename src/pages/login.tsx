import { useState } from 'react';

import { useForm } from '@mantine/form';
import { useAuth } from 'components/AuthContext';
import { showNotification } from '@mantine/notifications';
import { Flex, Card, Button, TextInput, PasswordInput, LoadingOverlay, Checkbox } from '@mantine/core';

export default function Login() {
  const { login } = useAuth();
  const [visible, setVisible] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  const handleLogin = async (val: any) => {
    setVisible(true);

    const { success, message } = await login({
      username: val.username,
      password: val.password,
      remember: val.remember,
    });

    if (!success)
      showNotification({
        color: 'red',
        title: 'Login Failed',
        message,
      });

    setVisible(false);
  };

  return (
    <Flex mih={50} gap="xs" justify="center" align="center" direction="column" style={{ height: '100%' }}>
      <h1>Flexi</h1>
      <Card withBorder p="lg" shadow="md" radius="md">
        <form onSubmit={form.onSubmit(handleLogin)}>
          <LoadingOverlay visible={visible} overlayBlur={2} />
          <Flex w={{ base: 240, sm: 300 }} gap="sm" direction="column">
            <TextInput
              withAsterisk
              required
              label="Username"
              placeholder="John Doe"
              {...form.getInputProps('username')}
            />
            <PasswordInput
              withAsterisk
              required
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />
            <Checkbox label="Keep me logged in" {...form.getInputProps('remember', { type: 'checkbox' })} />
            <Button type="submit" mt={8}>
              Login
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}
