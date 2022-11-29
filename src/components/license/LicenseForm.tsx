import { useState, useEffect } from 'react';

import fetcher from 'libs/fetcher';

import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { DateRangePicker, type DateRangePickerValue } from '@mantine/dates';
import { Button, Checkbox, NumberInput, Space, Stack, TextInput } from '@mantine/core';

import { CompanySelect, ProductSelect } from 'components/reusable';

type LicenseFormProps = {
  value?: Partial<License> | null;
  companyId?: string;
  productCode?: string;
  onSubmitted?: (data: License) => void;
} & Omit<React.HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;

export default function LicenseForm({ value, onSubmitted, companyId, productCode, ...others }: LicenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [subsRange, setSubsRange] = useState<DateRangePickerValue>([null, null]);

  const { setValues, reset, getInputProps, onSubmit, isTouched } = useForm({
    initialValues: (value as License) || defaultLicenseData,
    validate: {
      productCode: (val) => !val && !productCode && 'Product is required',
      companyId: (val) => !val && !companyId && 'Company ID is required',
      maxUser: (val) => val < 1 && !value && 'Max user must be greater than 0',
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

  const handleSubmit = async (license: License) => {
    setLoading(true);
    const t = !!value ? 'update' : 'create';
    try {
      const body = { ...license };

      companyId && (body.companyId = companyId);
      productCode && (body.productCode = productCode);

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
        method: !!value ? 'PUT' : 'POST',
        body,
      });

      if (res.success) {
        showNotification({ color: 'green', title: 'Success', message: `License ${t}d` });
        onSubmitted?.(res.result);
        reset();
      }
    } catch (err: any) {
      showNotification({ color: 'red', title: `Failed to ${t} license`, message: err.message });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit(handleSubmit)}>
      <Stack>
        {!productCode ? (
          <ProductSelect
            w="100%"
            label="Product"
            valueKey="code"
            placeholder="Select Product"
            fields={['id', 'name', 'code']}
            {...getInputProps('productCode')}
          />
        ) : (
          <>
            <input type="hidden" value={productCode} />
          </>
        )}
        {!companyId ? (
          <CompanySelect
            w="100%"
            label="Company"
            fields={['id', 'name']}
            placeholder="Select Company"
            {...getInputProps('companyId')}
          />
        ) : (
          <>
            <input type="hidden" value={companyId} />
          </>
        )}
        <TextInput w="100%" label="Instance URL" {...getInputProps('instanceUrl')} />
        <NumberInput w="100%" label="Max User" min={1} {...getInputProps('maxUser')} />
        {!value && (
          <div>
            <Checkbox
              checked={isSubscribe}
              label="Cloud Subscription"
              onChange={(r) => setIsSubscribe(r.currentTarget.checked)}
            />
            {isSubscribe && (
              <DateRangePicker
                mt={4}
                w="100%"
                value={subsRange}
                clearable={!value}
                onChange={setSubsRange}
                label="Subscription Period"
              />
            )}
          </div>
        )}
        <Space />
        <Button
          disabled={(value && !isTouched()) || (isSubscribe && (!subsRange[0] || !subsRange[1]))}
          loading={loading}
          type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
}

export const defaultLicenseData = {
  id: '',
  companyId: '',
  productCode: '',
  maxUser: 1,
} as Partial<License>;
