import { StackContext, Table } from '@serverless-stack/resources';
/**
 * This table contains all the user related information
 */
export const createUserTable = async (stack: StackContext['stack']) => {
  return new Table(stack, 'USER', {
    fields: {
      PK: 'string',
      SK: 'string',
    },
    primaryIndex: {
      partitionKey: 'PK',
      sortKey: 'SK',
    },
  });
};

/**
 * This table contains all the reference information, which includes
 * - comment
 * - glossary
 * - sutra reference
 */
export const createReferenceTable = async (stack: StackContext['stack']) => {
  const referenceTable = new Table(stack, 'REFERENCE', {
    fields: {
      PK: 'string',
      SK: 'string',
      sutraId: 'string',
      rollId: 'string',
      paragraphId: 'string',
      resolved: 'number',
      parentId: 'string',
    },
    primaryIndex: {
      partitionKey: 'PK',
      sortKey: 'SK',
    },
    localIndexes: {
      'sutraId-index': {
        sortKey: 'sutraId',
      },
      'rollId-index': {
        sortKey: 'rollId',
      },
      'paragraphId-index': {
        sortKey: 'paragraphId',
      },
      'resolved-index': {
        sortKey: 'resolved',
      },
      'parentId-index': {
        sortKey: 'parentId',
      },
    },
  });

  return referenceTable;
};

/**
 * This table contains all the translation related information
 */
export const createTranslationTable = async (stack: StackContext['stack']) => {
  const translationTable = new Table(stack, 'TRANSLATION', {
    fields: {
      PK: 'string',
      SK: 'string',
      kind: 'string',
    },
    primaryIndex: {
      partitionKey: 'PK',
      sortKey: 'SK',
    },
    localIndexes: {
      'kind-index': {
        sortKey: 'kind',
      },
    },
  });
  return translationTable;
};
