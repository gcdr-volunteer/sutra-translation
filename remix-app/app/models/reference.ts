import type { CreatedType, CreateType, Key, RefBook, Reference } from '~/types';
import {
  dbBulkInsert,
  dbGetByIndexAndKey,
  dbGetByKey,
  dbGetByPartitionKey,
  dbGetBySortKeyBeginwith,
  dbInsert,
  dbUpdate,
} from './external_services/dynamodb';

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
  const existingRef = await getReferenceByPrimaryKey({ PK: reference.PK, SK: reference.SK });
  if (existingRef) {
    const newRef = {
      ...existingRef,
      content: reference.content,
    };
    return await updateReference(newRef);
  }
  return await createReference(reference);
};

export const bulkInsertReference = async (references: CreateType<Reference>[]) => {
  return await dbBulkInsert({ tableName: process.env.REFERENCE_TABLE, docs: references });
};

export const createRefBook = async (refBook: RefBook) => {
  const newRefBook = { ...refBook, PK: 'REFBOOK', SK: refBook.bookname };
  return await dbInsert({ tableName: process.env.REFERENCE_TABLE, doc: newRefBook });
};

export const updateRefBook = async (refBook: Partial<RefBook> & Required<Key>) => {
  return await dbUpdate({ tableName: process.env.REFERENCE_TABLE, doc: refBook });
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

export const handleGetReferencesByPK = async (PK: string) => {
  const references = await dbGetByPartitionKey<CreatedType<Reference>>({
    tableName: process.env.REFERENCE_TABLE,
    PK,
  });
  if (references?.length) {
    return references;
  }
  return [];
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
