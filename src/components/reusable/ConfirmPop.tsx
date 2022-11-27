import { cloneElement, useState } from 'react';
import { Button, Flex, Popover, Stack, Text } from '@mantine/core';

type ConfirmPopProps = {
  color?: string;
  confirmText?: string;
  onConfirm?: () => void;
} & React.ComponentPropsWithoutRef<typeof Popover>;

export default function ConfirmPop({ confirmText, onConfirm, children, color, ...restProps }: ConfirmPopProps) {
  const [opened, setOpened] = useState(false);

  return (
    <Popover opened={opened} onClose={() => setOpened(false)} {...restProps}>
      <Popover.Target>{renderTrigger(children as React.ReactElement, setOpened)}</Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Text align="center">{confirmText || 'Are you sure?'}</Text>
          <Flex gap={12}>
            <Button color={color} onClick={() => (setOpened(false), onConfirm?.())}>
              Confirm
            </Button>
            <Button color={color} onClick={() => setOpened(false)} variant="outline">
              Cancel
            </Button>
          </Flex>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

const renderTrigger = (child: React.ReactElement, mutator: (v: boolean) => void) =>
  cloneElement(child, {
    onClick: (e: any) => (child.props.onClick?.(e), mutator(true)),
  });
