import { baseSchemaForCreate } from '~/utils/schema_validator';
import * as yup from 'yup';

export const newTranslationSchema = () => {
  const baseSchema = baseSchemaForCreate();
  const translationSchema = baseSchema.shape({
    translation: yup.string().trim().required('submitted tranlation cannot be empty'),
    PK: yup.string().trim().required('submitted translation partition key cannot be empty'),
    SK: yup.string().trim().required('submitted translation sort key cannot be empty'),
  });
  return translationSchema;
};
