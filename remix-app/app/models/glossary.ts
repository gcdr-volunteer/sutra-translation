import {
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { Glossary } from '~/types/glossary';
import { utcNow } from '~/utils';
import { dbClient } from './external_services/dynamodb';

export const createNewGlossary = async (glossary: Glossary) => {
  const params: PutItemCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    Item: marshall({
      PK: 'COMMENT',
      SK: `GLOSSARY-${utcNow()}`,
      ...glossary,
    }),
  };
  return await dbClient().send(new PutItemCommand(params));
};

export const getAllGlossary = async (): Promise<Glossary[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.COMMENT_TABLE,
    KeyConditionExpression: 'PK = :comment AND begins_with(SK, :kind)',
    ExpressionAttributeValues: marshall({
      ':comment': 'COMMENT',
      ':kind': 'GLOSSARY',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Glossary);
  }
  return [];
};
