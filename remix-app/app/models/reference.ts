import type { CreatedType, CreateType, Key, RefBook, Reference } from '~/types';
import {
  dbGetByIndexAndKey,
  dbGetByKey,
  dbGetByPartitionKey,
  dbGetBySortKeyBeginwith,
  dbInsert,
  dbUpdate,
} from './external_services/dynamodb';
import { handleGetLatestReferenceIdByParagraphId } from '~/services/__app/reference/$sutraId/$rollId.staging';

export const createReference = async (reference: CreateType<Reference>) => {
  return await dbInsert({ tableName: process.env.REFERENCE_TABLE, doc: reference });
};

export const updateReference = async (reference: Partial<Reference> & Required<Key>) => {
  return await dbUpdate({ tableName: process.env.REFERENCE_TABLE, doc: reference });
};

export const getReferenceByPrimaryKey = async (
  key: Key
): Promise<CreatedType<Reference> | undefined> => {
  return await dbGetByKey({ key, tableName: process.env.REFERENCE_TABLE });
};

export const upsertReference = async (reference: CreateType<Reference>) => {
  const existingRef = await getReferenceByPrimaryKey({ PK: 'REFERENCE', SK: reference.SK });
  if (existingRef) {
    const newRef = {
      ...existingRef,
      content: reference.content,
    };
    return await updateReference(newRef);
  }
  const SK = await handleGetLatestReferenceIdByParagraphId(reference.paragraphId);
  return await createReference({ ...reference, SK });
};

export const createRefBook = async (refBook: RefBook) => {
  const newRefBook = { ...refBook, PK: 'REFBOOK', SK: refBook.bookname };
  return await dbInsert({ tableName: process.env.REFERENCE_TABLE, doc: newRefBook });
};

export const getReferencesByPartitionKey = async (
  PK: string
): Promise<CreatedType<Reference>[]> => {
  return await dbGetByPartitionKey<CreatedType<Reference>>({
    tableName: process.env.REFERENCE_TABLE,
    PK,
  });
};

export const getAllRefBooks = async () => {
  return await dbGetByPartitionKey<CreatedType<RefBook>>({
    tableName: process.env.REFERENCE_TABLE,
    PK: 'REFBOOK',
  });
};

export const getLatestReference = async (
  SK: string
): Promise<CreatedType<Reference> | undefined> => {
  const references = await dbGetBySortKeyBeginwith<CreatedType<Reference>>({
    tableName: process.env.REFERENCE_TABLE,
    key: {
      PK: 'REFERENCE',
      SK,
    },
    sort: false,
  });
  if (references?.length) {
    return references[0];
  }
  return undefined;
};

export const getReferencesBySK = async (SK: string) => {
  const references = await dbGetBySortKeyBeginwith<CreatedType<Reference>>({
    tableName: process.env.REFERENCE_TABLE,
    key: {
      PK: 'REFERENCE',
      SK,
    },
    sort: true,
  });
  if (references?.length) {
    return references;
  }
  return [];
};

export const getRefBookBySutraId = async (sutraId: string) => {
  return dbGetByIndexAndKey<CreatedType<RefBook>>({
    tableName: process.env.REFERENCE_TABLE,
    key: { PK: 'REFBOOK', sutraId },
    indexName: 'sutraId-index',
  });
};

export const getTargetReferencesByRollId = async (
  rollId: string
): Promise<CreatedType<Reference>[]> => {
  return dbGetByIndexAndKey({
    tableName: process.env.REFERENCE_TABLE,
    key: { rollId, kind: 'REFERENCE' },
    indexName: 'rollId-kind-index',
  });
};
