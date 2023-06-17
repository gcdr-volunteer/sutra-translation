import * as yup from 'yup';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import { logger } from '~/utils';
import { created } from 'remix-utils';
import { Intent } from '~/types/common';
import { json } from '@remix-run/node';
import { getLatestReference, upsertReference } from '~/models/reference';
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
    paragraphId: yup.string().trim().required('paragraphId cannot be empty'),
    kind: yup.mixed<'REFERENCE'>().default('REFERENCE'),
  });
  return referenceSchema;
};

export const handleCreateNewReference = async (newReference: {
  paragraphIndex: string;
  sentenceIndex: string;
  paragraphId: string;
  content: string;
  totalSentences: string;
  sutraId: string;
  rollId: string;
  finish: boolean;
}) => {
  logger.log(handleCreateNewReference.name, 'newReference', newReference);
  const { sentenceIndex, paragraphIndex, totalSentences, sutraId, rollId, paragraphId, finish } =
    newReference;
  try {
    const result = await schemaValidator({
      schema: newReferenceSchema(),
      obj: newReference,
    });
    logger.log(handleCreateNewReference.name, 'result', result);
    const sentenceIndexNum = sentenceIndex ? parseInt(sentenceIndex) + 1 : 0;
    const paragraphIndexNum = paragraphIndex ? parseInt(paragraphIndex) + 1 : 0;
    const totalSentenceIndexNum = totalSentences ? parseInt(totalSentences) : 0;

    const latestRef = await getLatestReference(paragraphId);
    const reference = {
      content: result.content ?? '',
      // TODO: this needs to be updated to match user profile language
      PK: 'REFERENCE',
      SK: latestRef?.SK || `${paragraphId}-R0000`,
      sutraId,
      rollId,
      finish: sentenceIndexNum === totalSentenceIndexNum,
      sentenceIndex: sentenceIndexNum,
      paragraphIndex: paragraphIndexNum,
      kind: result.kind,
      paragraphId,
    };
    logger.log(handleCreateNewReference.name, 'new reference', reference);
    await upsertReference(reference);
    return created({
      payload: {
        paragraphIndex: paragraphIndexNum,
        sentenceIndex: sentenceIndexNum,
        finish: finish,
      },
      intent: Intent.CREATE_REFERENCE,
    });
  } catch (errors) {
    logger.error(handleCreateNewReference.name, 'error', errors);
    return json({ errors: { errors } });
  }
};

export const handleGetLatestReferenceIdByParagraphId = async (paragraphId: string) => {
  try {
    const reference = await getLatestReference(paragraphId);
    if (reference) {
      const idNumber = parseInt(reference?.SK.slice(-4)) + 1;

      return `${paragraphId}-R${idNumber.toString().padStart(4, '0')}`;
    }
    return `${paragraphId}-R0000`;
  } catch (error) {
    logger.error(handleGetLatestReferenceIdByParagraphId.name, 'error', error);
    return '';
  }
};
