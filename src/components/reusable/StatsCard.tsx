import { Text, SimpleGrid, Paper, Center, Group } from '@mantine/core';

type StatsRingProps = {
  data: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }[];
} & React.ComponentPropsWithoutRef<typeof SimpleGrid>;

export default function StatsCard({ data, ...restProps }: StatsRingProps) {
  const stats = data.map((stat) => {
    return (
      <Paper withBorder radius="md" p="xs" key={stat.label}>
        <Group>
          <Center>{stat.icon}</Center>

          <div>
            <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
              {stat.label}
            </Text>
            <Text weight={700} size="xl">
              {stat.value}
            </Text>
          </div>
        </Group>
      </Paper>
    );
  });

  return (
    <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'sm', cols: 1 }]} {...restProps}>
      {stats}
    </SimpleGrid>
  );
}
