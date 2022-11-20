import { object, string } from 'yup';

export const createCompany = object({
  name: string().required('Company name is required'),
  contactName: string().required('Contact name is required'),
  contactNumber: string().required('Contact number is required'),
});

export const updateCompany = object({
  name: string(),
  contactName: string(),
  contactNumber: string(),
});
