import { type AnySchema, ValidationError } from 'yup';

export { createUser, authenticateUser } from './user';
export { createUpdateCompany } from './company';
export { createLicense, updateLicense, extendLicense } from './license';
export { createUpdateProduct } from './product';

export default async function validator(schema: AnySchema, data: unknown) {
  try {
    await schema.validate(data);
    return null;
  } catch (e: any) {
    if (e instanceof ValidationError) return e.message as string;
    else {
      console.error(e);
      return 'Server cannot handling your request, try again later';
    }
  }
}
