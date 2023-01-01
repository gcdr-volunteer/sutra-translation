import { StackContext } from '@serverless-stack/resources';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { isProd } from '../utils';
export const createUserTable = async (stack: StackContext['stack']) => {
  return new Table(stack, 'UserTable', {
    tableName: `${process.env.ENV}-USER-TABLE`,
    readCapacity: isProd() ? 20 : 5,
    partitionKey: {
      name: 'PK',
      type: AttributeType.STRING,
    },
    sortKey: {
      name: 'SK',
      type: AttributeType.STRING,
    },
  });
};

export const createCommentTable = async (stack: StackContext['stack']) => {
  const commentTable = new Table(stack, 'CommentTable', {
    tableName: `${process.env.ENV}-COMMENT-TABLE`,
    readCapacity: isProd() ? 20 : 5,
    partitionKey: {
      name: 'PK',
      type: AttributeType.STRING,
    },
    sortKey: {
      name: 'SK',
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: 'sutraId-index',
    sortKey: {
      name: 'sutraId',
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: 'rollId-index',
    sortKey: {
      name: 'rollId',
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: 'paragraphId-index',
    sortKey: {
      name: 'paragraphId',
      type: AttributeType.STRING,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: 'resolved-index',
    sortKey: {
      name: 'resolved',
      type: AttributeType.NUMBER,
    },
  });

  commentTable.addLocalSecondaryIndex({
    indexName: 'parentId-index',
    sortKey: {
      name: 'parentId',
      type: AttributeType.STRING,
    },
  });
  return commentTable;
};

export const createTranslationTable = async (stack: StackContext['stack']) => {
  const translationTable = new Table(stack, 'TranslationTable', {
    tableName: `${process.env.ENV}-TRANSLATION-TABLE`,
    readCapacity: isProd() ? 20 : 5,
    partitionKey: {
      name: 'PK',
      type: AttributeType.STRING,
    },
    sortKey: {
      name: 'SK',
      type: AttributeType.STRING,
    },
  });
  translationTable.addLocalSecondaryIndex({
    indexName: 'kind-index',
    sortKey: {
      name: 'kind',
      type: AttributeType.STRING,
    },
  });
  return translationTable;
};
