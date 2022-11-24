import dayjs from 'dayjs';

import { object, string, number, date } from 'yup';

const mainSchema = {
  companyId: string().required('Company id is required'),
  productCode: string().required('Product code is required'),
  maxUser: number().min(1, 'Minimal one user provided').required('Max user is required'),
};

export const createLicense = object({
  ...mainSchema,
  type: string().oneOf(['CLOUD', 'ONPREMISE'] as License['type'][], 'Invalid license type provided'),
  subscriptionStart: date().min(
    dayjs().startOf('day').subtract(12, 'hours').toDate(),
    'Subscription start must be greater than or equal to current date'
  ),
  subscriptionEnd: date()
    .min(dayjs().add(1, 'day').toDate(), 'Subscription end must be greater than tomorrow')
    .when('subscriptionStart', (subscriptionStart: Date | undefined, schema: any) =>
      subscriptionStart
        ? schema.min(subscriptionStart, 'Subscription end must be greater than subscription start')
        : schema
    ),
});

export const extendLicense = object({
  subscriptionEnd: date()
    .required()
    .min(dayjs().add(1, 'day').toDate(), 'Subscription end must be greater than tomorrow'),
});

export const updateLicense = object({ ...mainSchema });
