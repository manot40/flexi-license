import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { CompanySelect, ProductSelect } from 'components/reusable';
import { DateRangePicker, type DateRangePickerValue } from '@mantine/dates';
import { Modal, NumberInput, Stack, Button, Space, Checkbox } from '@mantine/core';

type LicenseModalProps = {
  opened: boolean;
  onClose: () => void;
  value?: Partial<License> | null;
  onSubmitted?: (data: License) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export default function LicenseModal({ opened, value, onClose, onSubmitted }: LicenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [subsRange, setSubsRange] = useState<DateRangePickerValue>([null, null]);

  const { setValues, reset, onSubmit, getInputProps } = useForm({
    initialValues: (value as License) || defaultLicenseData,
    validate: {
      productCode: (value) => !value && 'Product is required',
      companyId: (val) => !val && 'Company ID is required',
      maxUser: (val) => val < 1 && 'Max user must be greater than 0',
    },
  });

  useEffect(() => {
    if (value) {
      const { id, updatedAt, createdAt, createdBy, updatedBy, ...data } = value;
      setValues(data);
      setIsSubscribe(data.type == 'CLOUD');
      setSubsRange([
        data.subscriptionStart ? new Date(data.subscriptionStart) : null,
        data.subscriptionEnd ? new Date(data.subscriptionEnd) : null,
      ]);
    } else {
      reset();
    }
    // eslint-disable-next-line
  }, [value]);

  const isEdit = !!value?.id;

  const handleSubmit = async (license: License) => {
    setLoading(true);
    const t = isEdit ? 'update' : 'create';
    try {
      const body = { ...license };

      if (isSubscribe) {
        body.type = 'CLOUD';
        if (subsRange[0] && subsRange[1]) {
          body.subscriptionStart = subsRange[0] as Date;
          body.subscriptionEnd = subsRange[1] as Date;
        } else {
          showNotification({
            title: 'Validation Error',
            message: 'Please select subscription range',
            color: 'red',
          });
        }
      } else {
        body.type = 'ONPREMISE';
      }

      const res = await fetcher<Res<License>>(`/api/v1/license/${value?.id || ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        body,
      });
      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `License ${t}d` });
        onSubmitted?.(res.result);
        onClose?.();
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} license`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => (reset(), onClose?.())}
      title={isEdit ? `Edit license data` : 'Create New License'}>
      <form onSubmit={onSubmit(handleSubmit)}>
        <Stack>
          <ProductSelect
            w="100%"
            label="Product"
            valueKey="code"
            placeholder="Select Product"
            fields={['id', 'name', 'code']}
            {...getInputProps('productCode')}
          />
          <CompanySelect
            w="100%"
            label="Company"
            fields={['id', 'name']}
            placeholder="Select Company"
            {...getInputProps('companyId')}
          />
          <NumberInput w="100%" label="Max User" placeholder="" min={1} {...getInputProps('maxUser')} />
          <div>
            <Checkbox
              checked={isSubscribe}
              label="Cloud Subscription"
              onChange={(r) => setIsSubscribe(r.currentTarget.checked)}
            />
            {isSubscribe && (
              <DateRangePicker mt={4} w="100%" label="Subscription Period" value={subsRange} onChange={setSubsRange} />
            )}
          </div>
          <Space />
          <Button disabled={isSubscribe && (!subsRange[0] || !subsRange[1])} loading={loading} type="submit">
            Submit
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}

export const defaultLicenseData = {
  id: '',
  companyId: '',
  productCode: '',
  maxUser: 1,
} as Partial<License>;
