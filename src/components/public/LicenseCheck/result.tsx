import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Flex, Text, Stack, Badge, Tooltip } from '@mantine/core';

dayjs.extend(relativeTime);

type Props = {
  product: Product;
  licenses: License[] | null;
};

export default function Result({ licenses: data, product }: Props) {
  if (!data || !data.length)
    return (
      <Flex miw={{ base: '70vw', xs: '240px' }} h={180} justify="center" align="center">
        <Text align="center" component="span" size={14} color="gray">
          {data ? 'No license found with this criteria' : 'Pick product and company name first'}
        </Text>
      </Flex>
    );

  return (
    <Stack p={12} spacing={12} sx={listStyle}>
      {data.map((license, i) => (
        <Entry key={i} data={license} prodName={product.name} />
      ))}
    </Stack>
  );
}

type EntryProps = {
  data: License;
  prodName: string;
};

const Entry = ({ prodName, data }: EntryProps) => {
  const isCloud = data.type === 'CLOUD';
  const subsEnd = dayjs(data.subscriptionEnd);
  const isExpired = isCloud ? subsEnd.isBefore(new Date()) : false;

  const endsIn = (() => {
    if (!isCloud) return '';

    return (
      <>
        , ends{' '}
        <Tooltip withArrow label={subsEnd.format('DD MMMM YYYY')}>
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>{subsEnd.fromNow()}</span>
        </Tooltip>
      </>
    );
  })();

  return (
    <Flex gap={18} align="center">
      <Stack spacing={2}>
        <Text size={18} sx={{ display: 'flex', alignItems: 'center' }}>
          {prodName}
          <Badge ml={8}>{data.type}</Badge>
          {isExpired && (
            <Badge ml={6} color="red">
              Expired
            </Badge>
          )}
        </Text>
        <Text size={16}>
          <b>{data.maxUser}</b> user{data.maxUser > 1 ? 's' : ''} included
        </Text>
        <Text size={14}>
          {isCloud ? 'Subscribed' : 'Registered'} from {dayjs(data.subscriptionStart).format('DD MMMM YYYY')}
          {endsIn}
        </Text>
      </Stack>
    </Flex>
  );
};

const listStyle = {
  '>div': { borderBottom: '1px solid #C0C0C0', paddingBottom: 16 },
  '>div:last-child': { border: 0 },
};
