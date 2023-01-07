import type { Glossary } from '~/types';
import { baseSchemaFor, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { translateZH2EN } from '~/models/external_services/deepl';
import { json } from '@remix-run/node';
import { createNewParagraph, getParagraphByPrimaryKey } from '~/models/paragraph';
import { logger } from '~/utils';
import { createNewGlossary, getAllGlossary } from '~/models/glossary';
import { Intent, Kind } from '~/types/common';
import { created, serverError } from 'remix-utils';
import { searchByTerm } from '~/models/external_services/opensearch';

const newTranslationSchema = () => {
  const baseSchema = baseSchemaFor(Kind.PARAGRAPH);
  const translationSchema = baseSchema.shape({
    translation: yup.string().trim().required('submitted tranlation cannot be empty'),
    PK: yup.string().trim().required('submitted translation partition key cannot be empty'),
    SK: yup.string().trim().required('submitted translation sort key cannot be empty'),
  });
  return translationSchema;
};

const newGlossarySchema = () => {
  const baseSchema = baseSchemaFor(Kind.GLOSSARY);
  const glossarySchema = baseSchema.noUnknown(true).shape({
    note: yup.string().trim(),
    origin: yup.string().trim().required(),
    target: yup.string().trim().required(),
    // TODO: use user profile language instead of hard coded
    origin_lang: yup.string().default('ZH'),
    target_lang: yup.string().default('EN'),
  });
  return glossarySchema;
};

export const hanldeDeepLFetch = async (origins: string[]) => {
  try {
    logger.log(hanldeDeepLFetch.name, 'origins', origins);
    const results = await translateZH2EN(origins);
    logger.log(hanldeDeepLFetch.name, 'results', results);
    return json({ data: results, intent: Intent.READ_DEEPL });
  } catch (error) {
    // TODO: handle error from frontend
    logger.error(hanldeDeepLFetch.name, 'error', error);
    return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
  }
};

export const handleNewTranslationParagraph = async (newTranslation: {
  index: string;
  PK: string;
  SK: string;
  translation: string;
}) => {
  logger.log(handleNewTranslationParagraph.name, 'newTranslation', newTranslation);
  try {
    const result = await schemaValidator({
      schema: newTranslationSchema(),
      obj: newTranslation,
    });
    logger.log(handleNewTranslationParagraph.name, 'result', result);
    const originParagraph = await getParagraphByPrimaryKey({
      PK: result.PK,
      SK: result.SK,
    });
    if (originParagraph) {
      const translatedParagraph = {
        ...originParagraph,
        content: result.translation,
        // TODO: this needs to be updated to match user profile language
        PK: result.PK?.replace('ZH', 'EN'),
        SK: result.SK?.replace('ZH', 'EN'),
      };
      logger.log(handleNewTranslationParagraph.name, 'translationParagraph', translatedParagraph);
      await createNewParagraph(translatedParagraph);
      return created({ data: { index: newTranslation.index }, intent: Intent.CREATE_TRANSLATION });
    }
    return serverError({ message: 'Oops, something wrong on our end' });
  } catch (errors) {
    logger.error(handleNewTranslationParagraph.name, 'error', errors);
    return json({ errors: { errors } });
  }
};

// TODO: need to rethink the algorithm here, cause glossary can growth quick
// like thousands of glossaries.
export const replaceWithGlossary = async (origins: string[]): Promise<string[]> => {
  const glossaries = await getAllGlossary();
  logger.log(replaceWithGlossary.name, 'glossaries', glossaries);
  const glossaryObj = glossaries?.reduce((acc, cur) => {
    acc[cur.origin] = cur.target;
    return acc;
  }, {} as Record<string, string>);
  logger.log(replaceWithGlossary.name, 'glossary obj', glossaryObj);
  const glossarySet = Object.keys(glossaryObj);
  if (glossarySet.length) {
    const regex = new RegExp(glossarySet.join('|'), 'gi');
    const results = origins?.map((origin) =>
      origin.replace(regex, (matched) => glossaryObj[matched])
    );
    logger.log(replaceWithGlossary.name, 'results', results);
    return results;
  }
  return origins;
};

export const handleNewGlossary = async (newGlossary: Omit<Glossary, 'kind'>) => {
  logger.log(handleNewGlossary.name, 'newGlossary', newGlossary);
  try {
    const result = await schemaValidator({
      schema: newGlossarySchema(),
      obj: newGlossary,
    });

    await createNewGlossary(result);

    return created({ data: {}, intent: Intent.CREATE_GLOSSARY });
  } catch (errors) {
    logger.error(handleNewGlossary.name, 'error', errors);
    return json({ errors: { errors } });
  }
};

export const esSearch = async () => {
  return await searchByTerm('random-stab term');
};
