import type { AsStr, CreateType, Footnote, Glossary, Reference, User } from '~/types';
import type { Paragraph } from '~/types/paragraph';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { translateZH2EN } from '~/models/external_services/deepl';
import { json } from '@remix-run/node';
import { upsertParagraph } from '~/models/paragraph';
import { logger } from '~/utils';
import {
  getAllGlossary,
  getGlossariesByTerm,
  getGlossaryByPage,
  insertBulkGlossary,
  isOriginTermExist,
  upsertGlossary,
} from '~/models/glossary';
import { Intent } from '~/types/common';
import { badRequest, created, serverError, unprocessableEntity } from 'remix-utils';
import { esClient } from '~/models/external_services/opensearch';
import { getRollByPrimaryKey } from '~/models/roll';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getFootnotesByPartitionKey, upsertFootnote } from '~/models/footnote';
import { baseGPT, translate } from '~/models/external_services/openai';
import { dbBulkGetByKeys } from '../../../../../models/external_services/dynamodb';
import { getSutraByPrimaryKey } from '../../../../../models/sutra';

const newTranslationSchema = () => {
  const baseSchema = initialSchema();
  // TODO: using strict().noUnknown() to stop unknown params
  const translationSchema = baseSchema.shape({
    content: yup
      .string()
      .trim()
      .transform((value) => value.replace(/\n/g, ''))
      .required('submitted tranlation cannot be empty'),
    rollId: yup
      .string()
      .trim()
      // TODO: update based on user profile
      .transform((value) => value.replace('ZH', 'EN'))
      .required(),
    paragraphId: yup
      .string()
      .trim()
      // TODO: update based on user profile
      .transform((value) => value.replace('ZH', 'EN'))
      .required(),
    category: yup.string().trim().default('NORMAL'),
    num: yup.number().required(),
    kind: yup.mixed<'PARAGRAPH'>().default('PARAGRAPH'),
  });
  return translationSchema;
};

const newGlossarySchema = (user: User) => {
  const baseSchema = initialSchema();
  const glossarySchema = baseSchema.shape({
    note: yup.string().trim().default(''),
    origin: yup.string().trim().required(),
    target: yup.string().trim().required(),
    short_definition: yup.string().trim().default(''),
    options: yup.string().trim().default(''),
    example_use: yup.string().trim().default(''),
    related_terms: yup.string().trim().default(''),
    terms_to_avoid: yup.string().trim().default(''),
    discussion: yup.string().trim().default(''),
    // TODO: use user profile language instead of hard coded
    origin_lang: yup.string().default('ZH'),
    target_lang: yup.string().default('EN'),
    updatedBy: yup.string().default(user.SK),
    createdBy: yup.string().default(user.SK),
    createdAlias: yup.string().default(user.username),
    kind: yup.mixed<'GLOSSARY'>().default('GLOSSARY'),
    intent: yup.string().strip(),
  });
  return glossarySchema;
};

const newFootnoteSchema = () => {
  const baseSchema = initialSchema();
  return baseSchema.shape({
    PK: yup.string().trim().required(),
    SK: yup.string().trim().required(),
    content: yup.string().trim().required(),
    offset: yup.number().required(),
    paragraphId: yup.string().required(),
    kind: yup.mixed<'FOOTNOTE'>().default('FOOTNOTE'),
  });
};

export const hanldeDeepLFetch = async ({ origins }: { origins: Record<string, string> }) => {
  try {
    logger.log(hanldeDeepLFetch.name, 'origins', origins);

    const results = await translateZH2EN(Object.values(origins));
    const obj = Object.keys(origins).reduce((acc, key, index) => {
      if (results) {
        acc[key] = results[index];
        return acc;
      }
      return acc;
    }, {} as Record<string, string>);
    logger.log(hanldeDeepLFetch.name, 'results', obj);
    return json({ payload: obj, intent: Intent.READ_DEEPL });
  } catch (error) {
    // TODO: handle error from frontend
    logger.error(hanldeDeepLFetch.name, 'error', error);
    return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
  }
};

export const handleOpenaiFetch = async ({
  content,
  category,
}: {
  content: string;
  category?: string;
}) => {
  try {
    logger.log(handleOpenaiFetch.name, 'content', content);

    // TODO: only fetch working user's profile glossary
    const glossaries = await getAllGlossary();
    const sourceGlossaries = glossaries?.map((glossary) => ({
      key: glossary.origin,
      value: glossary.target,
    }));

    const glossary = sourceGlossaries
      .filter((glossary) => content.indexOf(glossary.key) !== -1)
      .reduce((acc, cur) => {
        acc[cur.key] = cur.value;
        return acc;
      }, {} as Record<string, string>);
    const translation = await translate({ text: content, category }, glossary);
    logger.log(handleOpenaiFetch.name, 'results', translation);
    return translation;
  } catch (error) {
    // TODO: handle error from frontend
    logger.error(handleOpenaiFetch.name, 'error', error);
    return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
  }
};

export const handleChatGPT = async ({ text }: { text: string }): Promise<string> => {
  return await baseGPT({ text });
};

export const handleNewTranslationParagraph = async (newTranslation: {
  content: string;
  rollId: string;
  paragraphId: string;
  sutraId: string;
  num: number;
}) => {
  const { content, sutraId, rollId, paragraphId } = newTranslation;
  logger.log(handleNewTranslationParagraph.name, 'newTranslation', newTranslation);
  try {
    const result = await schemaValidator({
      schema: newTranslationSchema(),
      obj: newTranslation,
    });
    logger.log(handleNewTranslationParagraph.name, 'result', result);
    const sutra = await getSutraByPrimaryKey({ PK: 'TRIPITAKA', SK: result.sutraId });
    const roll = await getRollByPrimaryKey({ PK: sutraId, SK: result.rollId });
    if (content) {
      const translatedParagraph: CreateType<Paragraph> = {
        ...result,
        content: result.content,
        PK: result.rollId,
        SK: result.paragraphId,
        originPK: rollId,
        originSK: paragraphId,
        sutra: sutra?.title ?? '',
        roll: roll?.subtitle ?? '',
        finish: true,
      };
      logger.log(handleNewTranslationParagraph.name, 'translationParagraph', translatedParagraph);
      return await upsertParagraph(translatedParagraph);
    }
  } catch (errors) {
    logger.error(handleNewTranslationParagraph.name, 'error', errors);
    return json({ errors: { errors } });
  }
};

// TODO: need to rethink the algorithm here, cause glossary can growth quick
// like thousands of glossaries.
export const replaceWithGlossary = async (
  origins: Record<string, string>
): Promise<Record<string, string>> => {
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
    const results = Object.entries(origins)?.reduce((acc, [key, value]) => {
      acc[key] = value.replace(regex, (matched) => glossaryObj[matched]);
      return acc;
    }, {} as Record<string, string>);
    logger.log(replaceWithGlossary.name, 'results', results);
    return results;
  }
  return origins;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const composeContent = (result: any) => {
  const {
    origin,
    target,
    short_definition,
    note,
    options,
    example_use,
    related_terms,
    terms_to_avoid,
    discussion,
  } = result;
  return `${origin?.toLocaleLowerCase()}-${target?.toLocaleLowerCase()}-${short_definition?.toLocaleLowerCase()}-${options?.toLocaleLowerCase()}-${note?.toLocaleLowerCase()}-${example_use?.toLocaleLowerCase()}-${related_terms?.toLocaleLowerCase()}-${terms_to_avoid?.toLocaleLowerCase()}-${discussion?.toLocaleLowerCase()}`;
};

export const handleCreateNewGlossary = async ({
  newGlossary,
  user,
}: {
  newGlossary: AsStr<Partial<Glossary>>;
  user: User;
}) => {
  logger.log(handleCreateNewGlossary.name, 'newGlossary', newGlossary);
  try {
    const result = await schemaValidator({
      schema: newGlossarySchema(user),
      obj: newGlossary,
    });

    logger.log(handleCreateNewGlossary.name, 'result', result);
    const resultWithContent = { ...result, content: composeContent(result) };
    await upsertGlossary(resultWithContent);

    return created({
      payload: { origin: result.origin, target: result.target },
      intent: Intent.CREATE_GLOSSARY,
    });
  } catch (errors) {
    logger.error(handleCreateNewGlossary.name, 'error', errors);
    if (errors instanceof ConditionalCheckFailedException) {
      return unprocessableEntity({
        errors: { unknown: 'this is a duplicated glossary, please check if it already exists' },
        intent: Intent.CREATE_GLOSSARY,
      });
    }
    return badRequest({
      errors,
      intent: Intent.CREATE_GLOSSARY,
    });
  }
};

export const handleCreateBulkGlossary = async ({
  glossaries,
  user,
}: {
  glossaries: AsStr<Partial<Glossary>>[];
  user: User;
}) => {
  try {
    const newGlossaries = await Promise.all(
      glossaries.map((glossary) =>
        schemaValidator({
          schema: newGlossarySchema(user),
          obj: glossary,
        })
      )
    );

    const glossariesToInsert = [];
    const glossariesDuplicated = [];
    for await (const glossary of newGlossaries) {
      const isExist = await isOriginTermExist({ term: glossary.origin });
      if (isExist) {
        glossariesDuplicated.push(glossary);
      } else {
        const content = composeContent(glossary);
        const newGloss = { ...glossary, content };
        glossariesToInsert.push(newGloss);
      }
    }
    await insertBulkGlossary(glossariesToInsert);
    return created({
      payload: { report: glossariesDuplicated.map((glossary) => glossary.origin) },
      intent: Intent.BULK_CREATE_GLOSSARY,
    });
  } catch (errors) {
    console.log(errors);
  }
};

export const handleUpdateGlossary = async ({
  newGlossary,
  user,
}: {
  newGlossary: AsStr<Partial<Glossary>>;
  user: User;
}) => {
  logger.log(handleUpdateGlossary.name, 'newGlossary', newGlossary);
  try {
    const result = await schemaValidator({
      schema: newGlossarySchema(user),
      obj: newGlossary,
    });

    logger.log(handleUpdateGlossary.name, 'result', result);
    const resultWithContent = { ...result, content: composeContent(result) };
    await upsertGlossary(resultWithContent);

    return created({
      payload: { origin: result.origin, target: result.target },
      intent: Intent.UPDATE_GLOSSARY,
    });
  } catch (errors) {
    logger.error(handleUpdateGlossary.name, 'error', errors);
    if (errors instanceof ConditionalCheckFailedException) {
      return unprocessableEntity({
        errors: { unknown: 'this is a duplicated glossary, please check if it already exists' },
        intent: Intent.UPDATE_GLOSSARY,
      });
    }
    return badRequest({
      errors,
      intent: Intent.UPDATE_GLOSSARY,
    });
  }
};

export const handleGetGlossary = async (lastPage: string) => {
  try {
    const data = await getGlossaryByPage(lastPage);
    return json({ data, intent: Intent.READ_GLOSSARY });
  } catch (errors) {
    logger.error(handleGetGlossary.name, 'error', errors);
    if (errors instanceof ConditionalCheckFailedException) {
      return unprocessableEntity({
        errors: { error: 'cannot read glossary' },
        intent: Intent.READ_GLOSSARY,
      });
    }
    return serverError({ errors: { error: 'internal error' }, intent: Intent.READ_GLOSSARY });
  }
};

export const handleSearchByTerm = async (term: string) => {
  try {
    // TODO: this is just a stub function, refine it when you picking the
    // real ticket
    const client = await esClient();
    const body = {
      query: {
        match_phrase: {
          content: term.trim(),
        },
      },
      highlight: {
        pre_tags: '<em style="background: pink">',
        post_tags: '</em>',
        fields: {
          content: {},
        },
      },
    };

    const resp = await client.search({
      size: 10,
      index: 'translation',
      body,
    });
    if (resp.body.hits?.hits?.length) {
      logger.log(handleSearchByTerm.name, 'hits', resp.body?.hits.hits);
      logger.log(
        handleSearchByTerm.name,
        'hits.highlight',
        resp.body?.hits.hits?.[0].highlight?.content
      );
      // TODO: utiliza highlight result
      logger.log(
        handleSearchByTerm.name,
        'highlight',
        resp.body?.hits.hits?.[0].highlight?.content
      );
      const hits = resp.body.hits.hits;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const results = hits.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (hit: any) => ({ ...hit._source, content: hit.highlight?.content } as Paragraph | Glossary)
      );

      const counterParts = await dbBulkGetByKeys({
        tableName: process.env.TRANSLATION_TABLE,
        keys: results.map((result: { PK: string; SK: string }) => {
          let PK = result.PK;
          let SK = result.SK;
          if (PK.includes('ZH')) {
            PK = PK.replace('ZH', 'EN');
          } else {
            PK = PK.replace('EN', 'ZH');
          }
          if (SK.includes('ZH')) {
            SK = SK.replace('ZH', 'EN');
          } else {
            SK = SK.replace('EN', 'ZH');
          }
          return {
            PK,
            SK,
          };
        }),
      });

      return json({
        payload: { results, counterParts } as {
          results: (Paragraph | Glossary | Reference)[];
          counterParts: (Paragraph | Glossary)[];
        },
        intent: Intent.READ_OPENSEARCH,
      });
    }
    logger.info(handleSearchByTerm.name, 'did not get any result');
    return [];
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(handleSearchByTerm.name, 'warn', error);
    return json({ payload: [] as (Paragraph | Glossary)[], intent: Intent.READ_OPENSEARCH });
  }
};

export const handleSearchGlossary = async ({ text, filter }: { text: string; filter: string }) => {
  try {
    logger.log(handleSearchGlossary.name, 'params', { text, filter });
    const glossaries = await getGlossariesByTerm({ term: text?.toLowerCase() });
    logger.log(handleSearchGlossary.name, 'glossaries', glossaries);
    return json({
      payload: { results: glossaries as (Paragraph | Glossary)[] },
      intent: Intent.READ_OPENSEARCH,
    });
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(handleSearchGlossary.name, 'warn', error);
    return json({
      payload: { results: [] as (Paragraph | Glossary)[] },
      intent: Intent.READ_OPENSEARCH,
    });
  }
};

export const handleNewFootnote = async (footnote: Omit<Footnote, 'kind'>) => {
  logger.log(handleNewFootnote.name, 'footnote', footnote);
  try {
    const result = await schemaValidator({
      schema: newFootnoteSchema(),
      obj: footnote,
    });

    logger.log(handleNewFootnote.name, 'result', result);
    await upsertFootnote(result);

    return created({
      payload: {},
      intent: Intent.CREATE_FOOTNOTE,
    });
  } catch (errors) {
    logger.error(handleNewFootnote.name, 'error', errors);
    if (errors instanceof ConditionalCheckFailedException) {
      return unprocessableEntity({
        errors: { error: 'duplicated footnote' },
        intent: Intent.CREATE_FOOTNOTE,
      });
    }
    return serverError({ errors: { error: 'internal error' }, intent: Intent.CREATE_FOOTNOTE });
  }
};

export const getLatestFootnoteId = async (PK: string) => {
  function increaseId(id?: string) {
    if (id) {
      const idNumber = parseInt(id.slice(-4)) + 1;

      return {
        numId: idNumber,
        strId: `${PK}-F${idNumber.toString().padStart(4, '0')}`,
      };
    }
    return {
      numId: 1,
      strId: undefined,
    };
  }
  try {
    const footnotes = await getFootnotesByPartitionKey(PK);
    logger.log(getLatestFootnoteId.name, 'latest footnote', footnotes?.[0]);
    const { strId, numId } = increaseId(footnotes?.[0]?.SK);
    return {
      latestFootnoteIdNum: numId,
      latestFootnoteId: strId || `${PK}-F0001`,
    };
  } catch (error) {
    logger.error(getLatestFootnoteId.name, 'error', error);
    return {
      latestFootnoteIdNum: 0,
      latestFootnoteId: '',
    };
  }
};
