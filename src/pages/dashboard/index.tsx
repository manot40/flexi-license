import { Box, Space, Title } from '@mantine/core';
import { StatsCard } from 'components/reusable';

export default function Dashboard() {
  return (
    <Box>
      <Title order={1}>Dashboard</Title>
      <Space h={32} />
      <StatsCard
        data={[
          { label: 'One', value: 1000 },
          { label: 'Two', value: 2000 },
          { label: 'Three', value: 3000 },
          { label: 'Four', value: 4000 },
        ]}
      />
    </Box>
  );
}
