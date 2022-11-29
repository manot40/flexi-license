import dayjs from 'dayjs';
import fetcher from 'libs/fetcher';

import { useState } from 'react';

import { DatePicker } from '@mantine/dates';
import { Button, Stack, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

type Props = {
  data: Partial<License> | null;
  onSubmitted?: (data: License) => void;
} & React.ComponentProps<typeof Stack>;

export default function ExtendLicense({ data, onSubmitted, ...restProps }: Props) {
  const [loading, setLoading] = useState(false);
  const [extend, setExtend] = useState<Date | null>(null);

  const subsEnd = dayjs(data?.subscriptionEnd);

  const handleExtend = async () => {
    try {
      setLoading(true);
      if (!extend) return showNotification({ message: 'Please input extended date' });

      const res = await fetcher<Res<License>>(`/api/v1/license/${data?.id || ''}/extend`, {
        method: 'PATCH',
        body: { subscriptionEnd: extend },
      });

      if (res.success) {
        onSubmitted?.(res.result);
        showNotification({ color: 'green', title: 'Success', message: `License extended` });
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to extend license`, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const initDate = subsEnd.add(1).toDate();

  return (
    <Stack spacing={12} {...restProps}>
      <TextInput disabled label="Product Code" value={data?.productCode} />
      <TextInput label="Subscription End" value={subsEnd.format('DD/MMM/YYYY')} readOnly />
      <DatePicker initialMonth={initDate} minDate={initDate} value={extend} onChange={setExtend} label="Extend to" />
      <Button disabled={!data?.key} mt={18} loading={loading} onClick={handleExtend}>
        Extend License
      </Button>
    </Stack>
  );
}
