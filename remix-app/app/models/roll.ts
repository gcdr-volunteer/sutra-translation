import { QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient } from '~/models/external_services/dynamodb';
import type { Roll } from '~/types';
import type { QueryCommandInput } from '@aws-sdk/client-dynamodb';

export const getRollsBySutraId = async (PK: string): Promise<Roll[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: marshall({
      ':PK': PK,
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Roll);
  }
  return [];
};
