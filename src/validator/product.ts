import { object, string, boolean } from 'yup';

export const createUpdateProduct = object({
  code: string().min(3, 'Product code length must be greater than or equal to 3').required('Product code is required'),
  name: string().required('Product name is required'),
  isActive: boolean().nullable(),
});
