import * as yup from 'yup';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import { logger } from '~/utils';
import { created } from 'remix-utils';
import { Intent } from '~/types/common';
import { json } from '@remix-run/node';
import { createReference, getLatestReference } from '~/models/reference';
const newReferenceSchema = () => {
  const baseSchema = initialSchema();
  // TODO: using strict().noUnknown() to stop unknown params
  const referenceSchema = baseSchema.shape({
    content: yup
      .string()
      .trim()
      .optional()
      .transform((value) => {
        return value || 'not provided';
      }),
    PK: yup.string().trim().required('submitted translation partition key cannot be empty'),
    SK: yup.string().trim().required('submitted translation sort key cannot be empty'),
    kind: yup.mixed<'REFERENCE'>().default('REFERENCE'),
  });
  return referenceSchema;
};

export const handleCreateNewReference = async (
  newReference: {
    paragraphIndex: string;
    sentenceIndex: string;
    PK: string;
    SK: string;
    content: string;
    totalSentences: string;
    paragraph?: string;
  },
  { sutraId, rollId }: { sutraId?: string; rollId?: string }
) => {
  logger.log(handleCreateNewReference.name, 'newReference', newReference);
  const { sentenceIndex, paragraphIndex, totalSentences, paragraph } = newReference;
  try {
    const result = await schemaValidator({
      schema: newReferenceSchema(),
      obj: newReference,
    });
    logger.log(handleCreateNewReference.name, 'result', result);
    const sentenceIndexNum = sentenceIndex ? parseInt(sentenceIndex) : 0;
    const paragraphIndexNum = paragraphIndex ? parseInt(paragraphIndex) : 0;
    const totalSentenceIndexNum = totalSentences ? parseInt(totalSentences) : 0;

    const SK = await handleGetLatestReferenceId(result.SK);
    const kind = 'REFERENCE' as const;
    const reference = {
      content: result.content ?? '',
      // TODO: this needs to be updated to match user profile language
      PK: 'REFERENCE',
      SK,
      sutraId: sutraId ?? '',
      rollId: rollId ?? '',
      finish: sentenceIndexNum === totalSentenceIndexNum,
      sentenceIndex: sentenceIndexNum,
      paragraphIndex: paragraphIndexNum,
      paragraph: paragraph ? `${paragraph} ${result.content}` : result.content,
      kind,
      origin: 'Cleary',
      paragraphId: result.PK,
    };
    logger.log(handleCreateNewReference.name, 'translationParagraph', reference);
    await createReference(reference);
    return created({
      payload: {
        paragraphIndex,
        sentenceIndex,
        finish: sentenceIndexNum === totalSentenceIndexNum,
      },
      intent: Intent.CREATE_REFERENCE,
    });
  } catch (errors) {
    logger.error(handleCreateNewReference.name, 'error', errors);
    return json({ errors: { errors } });
  }
};

export const handleGetLatestReferenceId = async (paragraphId: string) => {
  try {
    const reference = await getLatestReference(paragraphId);
    if (reference) {
      const idNumber = parseInt(reference?.SK.slice(-4)) + 1;

      return `${paragraphId}-R${idNumber.toString().padStart(4, '0')}`;
    }
    return `${paragraphId}-R0000`;
  } catch (error) {
    logger.error(handleGetLatestReferenceId.name, 'error', error);
    return '';
  }
};
