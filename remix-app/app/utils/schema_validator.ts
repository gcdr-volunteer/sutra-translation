import * as yup from 'yup';
import { utcNow } from './datetime';
import type { ValidationError, AnyObjectSchema } from 'yup';

export const schemaValidator = async <S extends AnyObjectSchema, T>({
  schema,
  obj,
}: {
  schema: S;
  obj: T;
}) => {
  try {
    const result = await schema.validate(obj, { abortEarly: false });
    return result;
  } catch (error) {
    const errors = {} as Record<string, string>;
    (error as ValidationError).inner.forEach((err) => {
      if (err?.path) {
        errors[err.path] = err.message;
      }
    });
    throw errors;
  }
};

export const initialSchema = () => {
  return yup.object().shape({
    createdAt: yup.string().default(utcNow()),
    createdBy: yup.string().default('Admin'),
    updatedAt: yup.string().default(utcNow()),
    updatedBy: yup.string().default('Admin'),
  });
};
