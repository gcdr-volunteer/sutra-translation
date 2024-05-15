import type {
  AsStr,
  CreateType,
  CreatedType,
  Footnote,
  Glossary,
  GlossarySearchResult,
  Reference,
  ReferenceSearchResult,
  Roll,
  Sutra,
  SutraSearchResult,
  User,
} from '~/types';
import type { Paragraph } from '~/types/paragraph';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { translateZH2EN } from '~/models/external_services/deepl';
import { json } from '@remix-run/node';
import { upsertParagraph } from '~/models/paragraph';
import { getRollId, getSutraId, logger } from '~/utils';
import {
  getAllGlossary,
  getGlossaryByPage,
  insertBulkGlossary,
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
import { match } from 'ts-pattern';
import { handleGlossariesBySearchTerm } from '../../../glossary';

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
    origin: yup.string().trim().required(),
    target: yup.string().trim().required(),
    origin_sutra_text: yup.string().trim().default(''),
    target_sutra_text: yup.string().trim().default(''),
    sutra_name: yup.string().trim().default(''),
    volume: yup.string().trim().default(''),
    cbeta_frequency: yup.string().trim().default(''),
    glossary_author: yup.string().trim().default(''),
    translation_date: yup.string().trim().default(''),
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

export const handleOpenaiStreamFetch = async ({
  content,
  category,
}: {
  content: string;
  category?: string;
}) => {
  logger.log(handleOpenaiStreamFetch.name, 'content', content);

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
  return translate({ text: content, category }, glossary);
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

const composeContent = (result: Pick<Glossary, 'origin' | 'target'>) => {
  const { origin, target } = result;
  return `${origin?.toLocaleLowerCase()}-${target?.toLocaleLowerCase()}`;
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
    for await (const glossary of newGlossaries) {
      const content = composeContent(glossary);
      const newGloss = { ...glossary, content };
      glossariesToInsert.push(newGloss);
    }
    await insertBulkGlossary(glossariesToInsert);
    return created({
      payload: { report: [] },
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

export const handleSearchByTerm = async (
  term: string
): Promise<(ReferenceSearchResult | SutraSearchResult)[]> => {
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
      const hits = resp.body.hits.hits as {
        _source: CreatedType<Paragraph> | CreatedType<Reference>;
        highlight?: { content: string };
      }[];

      const results = hits.map((hit) => ({
        ...hit._source,
        content: hit.highlight?.content,
      }));

      logger.log(handleSearchByTerm.name, { searchResults: results });

      const paragraphKeys = results
        .map((value) =>
          match(value)
            .with({ kind: 'PARAGRAPH' }, ({ PK, SK }) => ({
              // TODO: change according user's profile
              PK: PK.startsWith('ZH') ? PK.replace('ZH', 'EN') : PK.replace('EN', 'ZH'),
              SK: SK.startsWith('ZH') ? SK.replace('ZH', 'EN') : SK.replace('EN', 'ZH'),
            }))
            .with({ kind: 'REFERENCE' }, ({ rollId, paragraphId }) => ({
              // TODO: change according user's profile
              PK: rollId,
              SK: paragraphId,
            }))
            .otherwise(() => ({ PK: '', SK: '' }))
        )
        .filter((value) => value.PK && value.SK)
        .filter(
          (value, index, self) =>
            index === self.findIndex((v) => v.PK === value.PK && v.SK === value.SK)
        );

      const sutraKeys = results
        .map((value) => {
          return match(value)
            .with({ kind: 'PARAGRAPH' }, ({ SK }) => ({
              PK: 'TRIPITAKA',
              SK: getSutraId(SK),
            }))
            .with({ kind: 'REFERENCE' }, ({ sutraId }) => ({
              PK: 'TRIPITAKA',
              SK: sutraId,
            }))
            .otherwise(() => ({ PK: '', SK: '' }));
        })
        .filter((value) => value.PK && value.SK)
        .filter(
          (value, index, self) =>
            index === self.findIndex((v) => v.PK === value.PK && v.SK === value.SK)
        );

      const rollKeys = results
        .map((value) => {
          return match(value)
            .with({ kind: 'PARAGRAPH' }, ({ SK }) => ({
              PK: getSutraId(SK),
              SK: getRollId(SK),
            }))
            .with({ kind: 'REFERENCE' }, ({ sutraId, rollId }) => ({
              PK: sutraId,
              SK: rollId,
            }))
            .otherwise(() => ({ PK: '', SK: '' }));
        })
        .filter((value) => value.PK && value.SK)
        .filter(
          (value, index, self) =>
            index === self.findIndex((v) => v.PK === value.PK && v.SK === value.SK)
        );

      logger.log(handleSearchByTerm.name, { sutraKeys, rollKeys, paragraphKeys });

      const [sutras, rolls, paragraphs] = await Promise.all([
        dbBulkGetByKeys<CreatedType<Sutra>>({
          tableName: process.env.TRANSLATION_TABLE,
          keys: sutraKeys,
        }),
        dbBulkGetByKeys<CreatedType<Roll>>({
          tableName: process.env.TRANSLATION_TABLE,
          keys: rollKeys,
        }),
        dbBulkGetByKeys<Paragraph>({
          tableName: process.env.TRANSLATION_TABLE,
          keys: paragraphKeys,
        }),
      ]);

      const finalResults = results.map((value) => {
        return match(value)
          .with({ kind: 'PARAGRAPH' }, ({ content, PK, SK, originPK, originSK }) => {
            const counterpart = paragraphs?.find(
              (counterPart) =>
                (counterPart.originPK === PK && counterPart.originSK === SK) ||
                (counterPart.originPK === originPK && counterPart.originSK === originSK)
            );
            const title = sutras?.find((sutra) => sutra.SK === getSutraId(SK))?.title;
            const subtitle = rolls?.find((roll) => roll.SK === getRollId(SK))?.subtitle;
            return {
              kind: 'sutra',
              data: {
                title,
                subtitle: `${subtitle} | P${SK.slice(-4)}`,
                origin: content,
                target: counterpart?.content,
              },
            } as SutraSearchResult;
          })
          .with({ kind: 'REFERENCE' }, ({ content, sutraId, name, rollId, paragraphId, SK }) => {
            const title = sutras?.find((sutra) => sutra.SK === sutraId)?.title;
            const subtitle = rolls?.find((roll) => roll.SK === rollId)?.subtitle;
            return {
              kind: 'reference',
              data: {
                title: name,
                subtitle: `${title} | ${subtitle} | ${paragraphId.slice(-5)}`,
                origin: content,
                target: '',
              },
            } as ReferenceSearchResult;
          })
          .exhaustive();
      });
      logger.log(handleSearchByTerm.name, { finalResults });
      return finalResults;
    }
    logger.info(handleSearchByTerm.name, 'did not get any result');
    return [];
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(handleSearchByTerm.name, 'warn', error);
    return [];
  }
};

export const handleSearchGlossary = async ({
  text,
  filter,
}: {
  text: string;
  filter: string;
}): Promise<GlossarySearchResult[]> => {
  try {
    logger.log(handleSearchGlossary.name, 'params', { text, filter });
    const { items: glossaries } = await handleGlossariesBySearchTerm({
      term: text?.toLowerCase().trim(),
      page: null,
    });
    logger.log(handleSearchGlossary.name, 'glossaries', glossaries);
    return glossaries?.map(
      (glossary) =>
        ({
          kind: 'glossary',
          data: {
            title: glossary.origin,
            subtitle: glossary.target,
            origin: glossary.origin,
            target: glossary.target,
            origin_sutra_text: glossary.origin_sutra_text,
            target_sutra_text: glossary.target_sutra_text,
            sutra_name: glossary.sutra_name,
            volume: glossary.volume,
            cbeta_frequency: glossary.cbeta_frequency,
            translation_date: glossary.translation_date,
            discussion: glossary.discussion,
          },
        } as GlossarySearchResult)
    );
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(handleSearchGlossary.name, 'warn', error);
    return [];
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
