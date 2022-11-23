import { useMemo } from 'react';

import { Flex, Stack, Title, Text } from '@mantine/core';

import { IconError404, IconEggCracked } from '@tabler/icons';

type ResultProps = {
  title?: string;
  message?: React.ReactNode;
  type?: '404' | 'error';
} & React.ComponentProps<typeof Flex>;

export default function Result({ title, message, children, type, ...props }: ResultProps) {
  const content = useMemo(() => {
    const titleContent = title && <Title {...titleProps}>{title}</Title>;

    const messageContent = (fallback: string) =>
      !message || typeof message == 'string' ? <Text {...messageProps}>{message || fallback}</Text> : message;

    switch (type) {
      case '404':
        return (
          <>
            <IconError404 {...iconProps} />
            {titleContent}
            {messageContent("Not something you're looking for")}
          </>
        );
      default:
        return (
          <>
            <IconEggCracked {...iconProps} />
            {titleContent}
            {messageContent('Something went wrong')}
          </>
        );
    }
  }, [type, title, message]);

  return (
    <Flex w="100%" h="100%" justify="center" align="center" {...props}>
      <Stack spacing={12} align="center">
        {content}
      </Stack>
    </Flex>
  );
}

const iconProps = { size: 100, opacity: 0.5 };
const titleProps = { opacity: 0.75, weight: 500, size: '1.66rem' };
const messageProps = { size: 'lg' as any, color: 'gray' };
