import { baseSchemaForCreate, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { translateZH2EN } from '~/models/external_services/deepl';
import { json } from '@remix-run/node';
import { createNewParagraph, getParagraphByPrimaryKey } from '~/models/paragraph';
import { logger } from '~/utils';

const newTranslationSchema = () => {
  const baseSchema = baseSchemaForCreate();
  const translationSchema = baseSchema.shape({
    translation: yup.string().trim().required('submitted tranlation cannot be empty'),
    PK: yup.string().trim().required('submitted translation partition key cannot be empty'),
    SK: yup.string().trim().required('submitted translation sort key cannot be empty'),
  });
  return translationSchema;
};

export const hanldeDeepLFetch = async (origins: string[]) => {
  try {
    logger.log('hanldeDeepLFetch', 'origins', origins);
    const results = await translateZH2EN(origins);
    logger.log('hanldeDeepLFetch', 'results', results);
    return json({ data: results, intent: 'deepl' });
  } catch (error) {
    return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
  }
};

export const handleNewTranslationParagraph = async (newTranslation: {
  index: string;
  PK: string;
  SK: string;
  translation: string;
}) => {
  try {
    const result = await schemaValidator({
      schema: newTranslationSchema(),
      obj: newTranslation,
    });
    const originParagraph = await getParagraphByPrimaryKey({
      PK: result.PK,
      SK: result.SK,
    });
    if (originParagraph) {
      const translatedParagraph = {
        ...originParagraph,
        content: result.translation,
        PK: result.PK?.replace('ZH', 'EN'),
        SK: result.SK?.replace('ZH', 'EN'),
      };
      await createNewParagraph(translatedParagraph);
      return json({ data: { index: newTranslation.index }, intent: 'translation' });
    }
  } catch (errors) {
    logger.error('handleNewTranslationParagraph', 'error', errors);
    return json({ errors: { errors } });
  }
};
