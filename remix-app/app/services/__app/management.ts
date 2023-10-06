import { getAllNotResolvedCommentsForRoll } from '~/models/comment';
import { dbUpdate } from '~/models/external_services/dynamodb';
import { getParagraphsByRollId } from '~/models/paragraph';
import { getRollByPrimaryKey } from '~/models/roll';
import { logger } from '~/utils';
import { initialSchema, schemaValidator } from '~/utils/schema_validator';
import * as yup from 'yup';
import { badRequest, created } from 'remix-utils';
import { Intent } from '~/types/common';
import { createRefBook, updateRefBook } from '~/models/reference';
import type { RefBook } from '~/types';

export const handleIsSutraRollComplete = async ({
  sutra,
  roll,
}: {
  sutra: string;
  roll: string;
}): Promise<{ isCompleted: true | false; type?: 'comment' | 'paragraph' }> => {
  const comments = await getAllNotResolvedCommentsForRoll(roll);
  if (comments?.length) {
    return {
      type: 'comment',
      isCompleted: false,
    };
  }
  const origins = await getParagraphsByRollId(roll.replace('EN', 'ZH'));
  const targets = await getParagraphsByRollId(roll);
  if (origins.length !== targets.length) {
    return {
      type: 'paragraph',
      isCompleted: false,
    };
  }

  return {
    isCompleted: true,
  };
};

const newRefBookSchema = () => {
  const baseSchema = initialSchema();
  const refBookSchema = baseSchema.shape({
    bookname: yup.string().trim().required('book name cannot be empty'),
    team: yup.string().trim().required('team name cannot be empty'),
    sutraId: yup.string().trim().required('sutra name cannot be empty'),
    order: yup.string().trim().required('order cannot be empty'),
    kind: yup.mixed<'REFBOOK'>().default('REFBOOK'),
  });
  return refBookSchema;
};

const updateRefBookSchema = () => {
  const baseSchema = initialSchema();
  const refBookSchema = baseSchema.shape({
    bookname: yup.string().trim().required('reference book name cannot be empty'),
    order: yup.string().trim().required('book order cannot be empty'),
    kind: yup.mixed<'REFBOOK'>().default('REFBOOK'),
  });
  return refBookSchema;
};

export const handleCreateRefBook = async (refBook: RefBook) => {
  try {
    const result = await schemaValidator({
      schema: newRefBookSchema(),
      obj: refBook,
    });
    logger.log(handleCreateRefBook.name, 'result', result);
    await createRefBook(result);
    return created({ data: {}, intent: Intent.CREATE_REF_BOOK });
  } catch (errors) {
    logger.error(handleCreateRefBook.name, 'errors', errors);
    return badRequest({ errors: errors, intent: Intent.CREATE_REF_BOOK });
  }
};

export const handleUpdateRefBook = async (refBook: Partial<RefBook>) => {
  try {
    const result = await schemaValidator({
      schema: updateRefBookSchema(),
      obj: refBook,
    });
    logger.log(handleUpdateRefBook.name, 'result', result);
    const updatedRefBook = {
      PK: 'REFBOOK',
      SK: result.bookname,
      order: result.order,
    };
    await updateRefBook(updatedRefBook);
  } catch (errors) {
    logger.error(handleCreateRefBook.name, 'errors', errors);
    return badRequest({ errors: errors, intent: Intent.UPDATE_REF_BOOK });
  }
};

export const handleMarkRollComplete = async ({ sutra, roll }: { sutra: string; roll: string }) => {
  const rolldoc = await getRollByPrimaryKey({ PK: sutra, SK: roll });
  if (rolldoc) {
    return dbUpdate({
      tableName: process.env.TRANSLATION_TABLE,
      doc: { ...rolldoc, SK: rolldoc.SK ?? '', PK: rolldoc?.PK ?? '', finish: true },
    });
  }
};
