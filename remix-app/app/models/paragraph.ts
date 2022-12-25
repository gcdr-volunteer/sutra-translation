import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
  ReturnValue,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dbClient } from '~/models/external_services/dynamodb';
import type { Paragraph } from '~/types/paragraph';

const getParagraphsByRollId = async (PK: string): Promise<Paragraph[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    KeyConditionExpression: 'PK = :PK',
    ExpressionAttributeValues: marshall({
      ':PK': PK,
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
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

export const getParagraphByPrimaryKey = async ({
  PK,
  SK,
}: {
  PK: string;
  SK: string;
}): Promise<Paragraph | undefined> => {
  const params: GetItemCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    Key: marshall({
      PK,
      SK,
    }),
  };
  const { Item } = await dbClient().send(new GetItemCommand(params));
  if (Item) {
    return unmarshall(Item) as Paragraph;
  }
  return undefined;
};

export const createNewParagraph = async (paragraph: Paragraph) => {
  const params: PutItemCommandInput = {
    TableName: process.env.TRANSLATION_TABLE,
    Item: marshall({
      ...paragraph,
    }),
    ConditionExpression: 'attribute_not_exists(#PK)',
    ExpressionAttributeNames: {
      '#PK': 'PK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient().send(new PutItemCommand(params));
};
