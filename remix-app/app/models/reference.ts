import type { CreatedType, CreateType, Reference } from '~/types';
import {
  dbGetByIndexAndKey,
  dbGetByPartitionKey,
  dbGetBySortKeyBeginwith,
  dbInsert,
} from './external_services/dynamodb';

export const createReference = async (reference: CreateType<Reference>) => {
  return await dbInsert({ tableName: process.env.COMMENT_TABLE, doc: reference });
};

export const getReferencesByPartitionKey = async (
  PK: string
): Promise<CreatedType<Reference>[]> => {
  return await dbGetByPartitionKey<CreatedType<Reference>>({
    tableName: process.env.COMMENT_TABLE,
    PK,
  });
};

export const getLatestReference = async (
  SK: string
): Promise<CreatedType<Reference> | undefined> => {
  const references = await dbGetBySortKeyBeginwith<CreatedType<Reference>>({
    tableName: process.env.COMMENT_TABLE,
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
    tableName: process.env.COMMENT_TABLE,
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

export const getTargetReferencesByRollId = async (
  rollId: string
): Promise<CreatedType<Reference>[]> => {
  return dbGetByIndexAndKey({
    tableName: process.env.COMMENT_TABLE,
    key: { rollId, kind: 'REFERENCE' },
    indexName: 'rollId-kind-index',
  });
};
