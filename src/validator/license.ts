import dayjs from 'dayjs';

import { object, string, number, date } from 'yup';

export const createUpdateLicense = object({
  type: string().oneOf(['CLOUD', 'ONPREMISE'] as License['type'][], 'Invalid license type provided'),
  maxUser: number().min(1, 'Minimal one user provided').required('Max user is required'),
  productCode: string().required('Product code is required'),
  companyId: string().required('Company id is required'),
  subscriptionStart: date().min(
    dayjs().startOf('day').toDate(),
    'Subscription start must be greater than or equal today'
  ),
  subscriptionEnd: date()
    .min(dayjs().add(1, 'day').toDate(), 'Subscription end must be greater than tomorrow')
    .when('subscriptionStart', (subscriptionStart: Date, schema: any) =>
      schema.min(subscriptionStart, 'Subscription end must be greater than subscription start')
    ),
});
