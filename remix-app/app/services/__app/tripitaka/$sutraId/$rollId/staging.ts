import type { Footnote, Glossary } from '~/types';
import type { Paragraph } from '~/types/paragraph';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { translateZH2EN } from '~/models/external_services/deepl';
import { json } from '@remix-run/node';
import { upsertParagraph, getParagraphByPrimaryKey } from '~/models/paragraph';
import { logger } from '~/utils';
import { getAllGlossary, getGlossariesByTerm, upsertGlossary } from '~/models/glossary';
import { Intent } from '~/types/common';
import { created, serverError, unprocessableEntity } from 'remix-utils';
import { esClient } from '~/models/external_services/opensearch';
import { getRollByPrimaryKey } from '~/models/roll';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { getFootnotesByPartitionKey, upsertFootnote } from '~/models/footnote';
import { translate } from '~/models/external_services/openai';

const newTranslationSchema = () => {
  const baseSchema = initialSchema();
  // TODO: using strict().noUnknown() to stop unknown params
  const translationSchema = baseSchema.shape({
    content: yup.string().trim().required('submitted tranlation cannot be empty'),
    PK: yup.string().trim().required(),
    SK: yup.string().trim().required(),
    kind: yup.mixed<'PARAGRAPH'>().default('PARAGRAPH'),
  });
  return translationSchema;
};

const newGlossarySchema = () => {
  const baseSchema = initialSchema();
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
  origins,
  category,
}: {
  origins: Record<string, string>;
  category?: string;
}) => {
  try {
    logger.log(handleOpenaiFetch.name, 'origins', origins);

    // TODO: only fetch working user's profile glossary
    const glossaries = await getAllGlossary();
    const sourceGlossaries = glossaries?.map((glossary) => ({
      key: glossary.origin,
      value: glossary.target,
    }));

    const results = await Promise.all(
      Object.values(origins).map((text) => {
        const glossaries = sourceGlossaries
          .filter((glossary) => text.indexOf(glossary.key) !== -1)
          .reduce((acc, cur) => {
            acc[cur.key] = cur.value;
            return acc;
          }, {} as Record<string, string>);
        return translate({ text, category }, glossaries);
      })
    );
    const obj = Object.keys(origins).reduce((acc, key, index) => {
      if (results) {
        acc[key] = results[index];
        return acc;
      }
      return acc;
    }, {} as Record<string, string>);
    logger.log(handleOpenaiFetch.name, 'results', obj);
    return json({ payload: obj, intent: Intent.READ_OPENAI });
  } catch (error) {
    // TODO: handle error from frontend
    logger.error(handleOpenaiFetch.name, 'error', error);
    return json({ errors: { deepl: (error as unknown as Error)?.message } }, { status: 400 });
  }
};

export const handleNewTranslationParagraph = async (
  newTranslation: {
    paragraphIndex: string;
    sentenceIndex: string;
    PK: string;
    SK: string;
    content: string;
    totalSentences: string;
  },
  { sutraId, rollId }: { sutraId?: string; rollId?: string }
) => {
  logger.log(handleNewTranslationParagraph.name, 'newTranslation', newTranslation);
  const { sentenceIndex, paragraphIndex, totalSentences } = newTranslation;
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
        PK: sutraId?.replace('ZH', 'EN') ?? '',
        SK: rollId?.replace('ZH', 'EN') ?? '',
      }),
    ]);
    if (originParagraph) {
      const sentenceIndexNum = sentenceIndex ? parseInt(sentenceIndex) : 0;
      const paragraphIndexNum = paragraphIndex ? parseInt(paragraphIndex) : 0;
      const totalSentenceIndexNum = totalSentences ? parseInt(totalSentences) : 0;

      const translatedParagraph = {
        ...originParagraph,
        content: result.content,
        // TODO: this needs to be updated to match user profile language
        PK: result.PK?.replace('ZH', 'EN'),
        SK: result.SK?.replace('ZH', 'EN'),
        sutra: roll?.title ?? '',
        roll: roll?.subtitle ?? '',
        finish: sentenceIndexNum === totalSentenceIndexNum,
        sentenceIndex: sentenceIndexNum,
        paragraphIndex: paragraphIndexNum,
      };
      logger.log(handleNewTranslationParagraph.name, 'translationParagraph', translatedParagraph);
      await upsertParagraph(translatedParagraph);
      return created({
        payload: {
          paragraphIndex,
          sentenceIndex,
          finish: sentenceIndexNum === totalSentenceIndexNum,
        },
        intent: Intent.CREATE_TRANSLATION,
      });
    }
    return serverError({ message: 'Oops, something wrong on our end' });
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

export const handleCreateNewGlossary = async (newGlossary: Omit<Glossary, 'kind'>) => {
  logger.log(handleCreateNewGlossary.name, 'newGlossary', newGlossary);
  try {
    const result = await schemaValidator({
      schema: newGlossarySchema(),
      obj: newGlossary,
    });

    logger.log(handleCreateNewGlossary.name, 'result', result);
    await upsertGlossary(result);

    return created({
      payload: { origin: result.origin, target: result.target },
      intent: Intent.CREATE_GLOSSARY,
    });
  } catch (errors) {
    logger.error(handleCreateNewGlossary.name, 'error', errors);
    if (errors instanceof ConditionalCheckFailedException) {
      return unprocessableEntity({
        errors: { error: 'duplicated glossary' },
        intent: Intent.CREATE_GLOSSARY,
      });
    }
    return serverError({ errors: { error: 'internal error' }, intent: Intent.CREATE_GLOSSARY });
  }
};

export const handleSearchByTerm = async (term: string) => {
  try {
    // TODO: this is just a stub function, refine it when you picking the
    // real ticket
    const client = await esClient();
    const query = {
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
      body: query,
    });
    if (resp.body.hits?.hits?.length) {
      logger.log(handleSearchByTerm.name, 'response', resp.body?.hits.hits);
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
      return json({ payload: results as (Paragraph | Glossary)[], intent: Intent.READ_OPENSEARCH });
    }
    logger.info(handleSearchByTerm.name, 'did not get any result');
    return [];
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(handleSearchByTerm.name, 'warn', error);
    return json({ payload: [] as (Paragraph | Glossary)[], intent: Intent.READ_OPENSEARCH });
  }
};

export const handleSearchGlossary = async (text: string) => {
  try {
    const glossaries = await getGlossariesByTerm(text?.toLowerCase());
    return json({
      payload: glossaries as (Paragraph | Glossary)[],
      intent: Intent.READ_OPENSEARCH,
    });
  } catch (error) {
    // TODO: handle this error in frontend?
    logger.warn(handleSearchByTerm.name, 'warn', error);
    return json({ payload: [] as (Paragraph | Glossary)[], intent: Intent.READ_OPENSEARCH });
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
