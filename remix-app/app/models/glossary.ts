import { PutItemCommand, QueryCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { hash } from '~/utils';
import { dbClient } from './external_services/dynamodb';
import type { PutItemCommandInput, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import type { Glossary } from '~/types/glossary';

export const createNewGlossary = async (glossary: Glossary) => {
  const SK = `GLOSSARY-${hash(`${glossary.origin}-${glossary.target}`)}`;
  const params: PutItemCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    Item: marshall({
      PK: 'GLOSSARY',
      SK,
      ...glossary,
      content: `${glossary.origin}-${glossary.target}`,
    }),
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
