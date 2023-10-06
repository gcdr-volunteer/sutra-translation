import * as yup from 'yup';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import { logger } from '~/utils';
import { json } from '@remix-run/node';
import {
  bulkInsertReference,
  getLatestReference,
  getRefBookBySutraId,
  updateReference,
} from '~/models/reference';
import type {
  AsStr,
  CreateType,
  CreatedType,
  Reference as TReference,
  User,
  Reference,
} from '../../../../types';
import { getSutraByPrimaryKey } from '../../../../models/sutra';
import { getRollByPrimaryKey } from '../../../../models/roll';
const newReferenceSchema = (user: User) => {
  const baseSchema = initialSchema();
  // TODO: using strict().noUnknown() to stop unknown params
  const referenceSchema = baseSchema.shape({
    content: yup
      .string()
      .trim()
      .transform((value) => {
        return value || 'not provided';
      })
      .required(),
    sutraId: yup.string().trim().required('sutraId cannot be empty'),
    rollId: yup.string().trim().required('rollId cannot be empty'),
    sutra: yup.string().trim().optional(),
    roll: yup.string().trim().optional(),
    paragraphId: yup.string().trim().optional(),
    intent: yup.string().strip(),
    updatedBy: yup.string().default(user.username),
    kind: yup.mixed<'REFERENCE'>().default('REFERENCE'),
  });
  return referenceSchema;
};

export const handleCreateNewReference = async ({
  newReference,
  user,
}: {
  newReference: AsStr<Partial<CreateType<TReference>>>;
  user: User;
}) => {
  logger.log(handleCreateNewReference.name, 'newReference', newReference);
  try {
    const result = await schemaValidator({
      schema: newReferenceSchema(user),
      obj: newReference,
    });
    logger.log(handleCreateNewReference.name, 'result', result);
    const contents = JSON.parse(result.content) as CreatedType<TReference>[];

    const references = contents.map((c) => ({
      PK: result.paragraphId || c.PK,
      SK: c.name,
      name: c.name,
      ...result,
      paragraphId: result.paragraphId || c.PK,
      content: c.content,
    }));

    logger.log(handleCreateNewReference.name, 'new references', references);
    await bulkInsertReference(references);
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

export const handleGetAllRefBooks = async (
  sutraId: string
): Promise<Pick<Reference, 'name' | 'content'>[]> => {
  try {
    const refBooks = await getRefBookBySutraId(sutraId);
    return refBooks
      .map((refbook) => ({
        order: refbook.order,
        name: refbook.bookname,
        content: 'click to edit',
      }))
      .sort((a, b) => {
        return parseInt(b.order, 10) - parseInt(a.order, 10);
      });
  } catch (error) {
    logger.error(handleGetAllRefBooks.name, 'error', error);
    return [];
  }
};

export const handleUpdateReference = async ({
  PK,
  SK,
  content,
}: {
  PK: string;
  SK: string;
  content: string;
}) => {
  try {
    await updateReference({ PK, SK, content });
  } catch (error) {}
};

export const handleGetSutraAndRoll = async ({
  sutraId,
  rollId,
}: {
  sutraId: string;
  rollId: string;
}) => {
  try {
    const sutra = await getSutraByPrimaryKey({ PK: 'TRIPITAKA', SK: sutraId });
    const roll = await getRollByPrimaryKey({ PK: sutraId, SK: rollId });
    return { sutra, roll };
  } catch (error) {
    console.error(error);
  }
};
