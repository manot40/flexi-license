import { AnySchema, ValidationError } from 'yup';

const validator = async (schema: AnySchema, data: unknown) => {
  try {
    await schema.validate(data);
    return null;
  } catch (e: any) {
    if (e instanceof ValidationError) return e.message as string;
    else return 'Server cannot handling your request, try again later';
  }
};

export default validator;
