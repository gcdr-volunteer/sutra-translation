import * as yup from 'yup';
import { utcNow } from './datetime';
import type { ValidationError, AnyObjectSchema } from 'yup';
import type { Kind } from '~/types/common';

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

export const baseSchemaFor = (kind: keyof typeof Kind) => {
  return yup.object().shape({
    createdAt: yup.string().default(utcNow()),
    createdBy: yup.string().default('Admin'),
    updatedAt: yup.string().default(utcNow()),
    updatedBy: yup.string().default('Admin'),
    kind: yup.mixed<keyof typeof Kind>().default(kind),
  });
};
