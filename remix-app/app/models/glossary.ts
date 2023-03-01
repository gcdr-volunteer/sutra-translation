import { PutItemCommand, QueryCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { hash } from '~/utils';
import { dbClient, dbGetByKey, dbUpdate } from './external_services/dynamodb';
import type { PutItemCommandInput, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import type { Glossary } from '~/types/glossary';
import type { UpdateType } from '~/types';

export const createNewGlossary = async (glossary: Glossary) => {
  const SK = `GLOSSARY-${hash(`${glossary.origin}-${glossary.target}`)}`;
  const params: PutItemCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    Item: marshall(
      {
        PK: 'GLOSSARY',
        SK,
        ...glossary,
        content: `${glossary.origin?.toLowerCase()}-${glossary.target?.toLowerCase()}`,
      },
      {
        removeUndefinedValues: true,
      }
    ),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient().send(new PutItemCommand(params));
};

export const getAllGlossary = async (): Promise<Glossary[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: marshall({
      ':pk': 'GLOSSARY',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Glossary);
  }
  return [];
};

export const getGlossariesByTerm = async (term: string): Promise<Glossary[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    FilterExpression: 'contains(#content, :term)',
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeNames: {
      '#content': 'content',
    },
    ExpressionAttributeValues: marshall({
      ':term': term,
      ':pk': 'GLOSSARY',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Glossary);
  }
  return [];
};
export const updateGlossary = async (doc: UpdateType<Glossary>) => {
  return await dbUpdate({ tableName: process.env.COMMENT_TABLE, doc });
};

export const upsertGlossary = async (glossary: Glossary | UpdateType<Glossary>) => {
  if (glossary?.PK && glossary?.SK) {
    const prevGlossary = await dbGetByKey({
      tableName: process.env.COMMENT_TABLE,
      key: { PK: glossary.PK ?? '', SK: glossary.SK ?? '' },
    });
    if (prevGlossary) {
      const newGlossary = {
        ...prevGlossary,
        ...glossary,
      };
      return await updateGlossary(newGlossary as UpdateType<Glossary>);
    }
  }
  return await createNewGlossary(glossary as Glossary);
};
