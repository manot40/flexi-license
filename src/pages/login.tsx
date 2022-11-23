import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useForm } from '@mantine/form';
import { useAuth } from 'components/AuthContext';
import { showNotification } from '@mantine/notifications';
import { Flex, Card, Button, TextInput, PasswordInput, LoadingOverlay, Checkbox, Title, Space } from '@mantine/core';

export default function Login() {
  const { user, login } = useAuth();
  const { query, replace } = useRouter();
  const [visible, setVisible] = useState(false);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      remember: false,
    },
  });

  useEffect(() => {
    if (user) {
      if (!query.redirect) replace('/dashboard');
      else replace(query.redirect as string);
    }

    if (query.message) {
      showNotification({ message: query.message as string });
      replace(`/login?redirect=${query.redirect || ''}`);
    }
  }, [query, user, replace]);

  const handleLogin = async (val: any) => {
    setVisible(true);

    try {
      await login({
        username: val.username,
        password: val.password,
        remember: val.remember,
      });
    } catch (err: any) {
      showNotification({
        color: 'red',
        title: 'Login Failed',
        message: err.message,
      });
    }

    setVisible(false);
  };

  if (user) return <LoadingOverlay visible={true} />;

  return (
    <Flex
      h="100%"
      w="100%"
      gap="xs"
      mih={50}
      align="center"
      justify="center"
      direction="column"
      style={{ position: 'fixed', top: 0, left: 0 }}>
      <Title order={1}>Flexi</Title>
      <Space h="md" />
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
