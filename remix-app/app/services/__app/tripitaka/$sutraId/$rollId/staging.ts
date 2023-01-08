import type { Glossary } from '~/types';
import type { Paragraph } from '~/types/paragraph';
import { baseSchemaFor, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { translateZH2EN } from '~/models/external_services/deepl';
import { json } from '@remix-run/node';
import { createNewParagraph, getParagraphByPrimaryKey } from '~/models/paragraph';
import { logger } from '~/utils';
import { createNewGlossary, getAllGlossary } from '~/models/glossary';
import { Intent } from '~/types/common';
import { created, serverError, unprocessableEntity } from 'remix-utils';
import { esClient } from '~/models/external_services/opensearch';
import { getRollByPrimaryKey } from '~/models/roll';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

const newTranslationSchema = () => {
  const baseSchema = baseSchemaFor('PARAGRAPH');
  // TODO: using strict().noUnknown() to stop unknown params
  const translationSchema = baseSchema.shape({
    translation: yup.string().trim().required('submitted tranlation cannot be empty'),
    PK: yup.string().trim().required('submitted translation partition key cannot be empty'),
    SK: yup.string().trim().required('submitted translation sort key cannot be empty'),
  });
  return translationSchema;
};

const newGlossarySchema = () => {
  const baseSchema = baseSchemaFor('GLOSSARY');
  const glossarySchema = baseSchema.shape({
    note: yup.string().trim(),
    origin: yup.string().trim().required(),
    target: yup.string().trim().required(),
    // TODO: use user profile language instead of hard coded
    origin_lang: yup.string().default('ZH'),
    target_lang: yup.string().default('EN'),
    kind: yup.mixed<'GLOSSARY'>().default('GLOSSARY'),
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

export const handleNewTranslationParagraph = async (
  newTranslation: {
    index: string;
    PK: string;
    SK: string;
    translation: string;
  },
  { sutraId, rollId }: { sutraId?: string; rollId?: string }
) => {
  logger.log(handleNewTranslationParagraph.name, 'newTranslation', newTranslation);
  try {
    const result = await schemaValidator({
      schema: newTranslationSchema(),
      obj: newTranslation,
    });
    logger.log(handleNewTranslationParagraph.name, 'result', result);
    const [originParagraph, roll] = await Promise.all([
      getParagraphByPrimaryKey({
        PK: result.PK,
        SK: result.SK,
      }),
      getRollByPrimaryKey({
        PK: sutraId?.replace('ZH', 'EN'),
        SK: rollId?.replace('ZH', 'EN'),
      }),
    ]);
    if (originParagraph) {
      const translatedParagraph = {
        ...originParagraph,
        content: result.translation,
        // TODO: this needs to be updated to match user profile language
        PK: result.PK?.replace('ZH', 'EN'),
        SK: result.SK?.replace('ZH', 'EN'),
        sutra: roll?.title ?? '',
        roll: roll?.subtitle ?? '',
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

    logger.log(handleNewGlossary.name, 'result', result);
    await createNewGlossary(result);

    return created({
      data: { origin: result.origin, target: result.target },
      intent: Intent.CREATE_GLOSSARY,
    });
  } catch (errors) {
    logger.error(handleNewGlossary.name, 'error', errors);
    if (errors instanceof ConditionalCheckFailedException) {
      return unprocessableEntity({
        errors: { error: 'duplicated glossary' },
        intent: Intent.CREATE_GLOSSARY,
      });
    }
    return serverError({ errors: { error: 'internal error' }, intent: Intent.CREATE_GLOSSARY });
  }
};

export const searchByTerm = async (term: string) => {
  try {
    // TODO: this is just a stub function, refine it when you picking the
    // real ticket
    const client = await esClient();
    const query = {
      query: {
        match: {
          content: {
            query: term.trim(),
          },
        },
      },
      highlight: {
        fields: {
          content: {},
        },
      },
    };

    const resp = await client.search({
      size: 10,
      index: 'translation',
      body: query,
    });
    if (resp.body.hits?.hits?.length) {
      logger.log(searchByTerm.name, 'response', resp.body?.hits.hits);
      // TODO: utiliza highlight result
      logger.log(searchByTerm.name, 'highlight', resp.body?.hits.hits?.[0].highlight?.content);
      const hits = resp.body.hits.hits;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = hits.map((hit: any) => hit._source as Paragraph | Glossary);
      return json({ data: results as (Paragraph | Glossary)[], intent: Intent.READ_OPENSEARCH });
    }
    return [];
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(searchByTerm.name, 'warn', error);
    return json({ data: [] as (Paragraph | Glossary)[], intent: Intent.READ_OPENSEARCH });
  }
};
