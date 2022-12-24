import { QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient } from '~/clients/dynamodb';
import { Roll } from '~/types';
import type { Paragraph } from '~/types/paragraph';

const getParagraphsByRollId = async (PK: string): Promise<Paragraph[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: marshall({
      ':PK': PK,
    }),
  };
  const { Items } = await dbClient.send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Paragraph);
  }
  return [];
};

export const getOriginParagraphsByRollId = async (PK: string): Promise<Paragraph[]> => {
  return getParagraphsByRollId(PK);
};

export const getTargetParagraphsByRollId = async (PK: string): Promise<Paragraph[]> => {
  const key = PK.replace('ZH', 'EN');
  return getParagraphsByRollId(key);
};
