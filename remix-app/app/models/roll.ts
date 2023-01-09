import { GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient } from '~/models/external_services/dynamodb';
import type { Roll } from '~/types';
import type { QueryCommandInput, GetItemCommandInput } from '@aws-sdk/client-dynamodb';

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

export const getRollByPrimaryKey = async ({
  PK,
  SK,
}: {
  PK?: string;
  SK?: string;
}): Promise<Roll | undefined> => {
  const params: GetItemCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    Key: marshall({
      PK,
      SK,
    }),
  };
  const { Item } = await dbClient().send(new GetItemCommand(params));
  if (Item) {
    return unmarshall(Item) as Roll;
  }
  return undefined;
};
