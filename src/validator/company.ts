import { object, string } from 'yup';

export const createUpdateCompany = object({
  name: string().required('Company name is required'),
  contactName: string().required('Contact name is required'),
  contactNumber: string().required('Contact number is required'),
});
