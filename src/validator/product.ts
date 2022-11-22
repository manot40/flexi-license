import { object, string, boolean } from 'yup';

export const createUpdateProduct = object({
  code: string()
    .length(3, 'Product code length must be greater than or equal to 3')
    .required('Product code is required'),
  name: string().required('Product name is required'),
  isActive: boolean().nullable(),
  description: string().length(10, 'Product description length must be greater than or equal to 10'),
});
