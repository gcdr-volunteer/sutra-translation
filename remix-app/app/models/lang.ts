import { dbClient } from '~/models/external_services/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommandInput,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { PutItemCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { composeSKForLang } from './utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Lang } from '~/types/lang';
dayjs.extend(utc);

export const createNewLang = async (lang: Lang) => {
  const { name } = lang;
  const SK = composeSKForLang({ name });
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK,
      ...lang,
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient().send(new PutItemCommand(params));
};

export const getLang = async (name: string) => {
  const SK = composeSKForLang({ name });
  const params: GetItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK,
    }),
  };
  const { Item } = await dbClient().send(new GetItemCommand(params));
  if (Item) {
    return unmarshall(Item) as Lang;
  }
  return undefined;
};

export const getAllLangs = async (): Promise<Lang[]> => {
  const params: QueryCommandInput = {
    TableName: process.env.USER_TABLE,
    KeyConditionExpression: 'PK = :team AND begins_with(SK, :lang)',
    ExpressionAttributeValues: marshall({
      ':team': 'TEAM',
      ':lang': 'LANG',
    }),
  };
  const { Items } = await dbClient().send(new QueryCommand(params));
  if (Items?.length) {
    return Items.map((Item) => unmarshall(Item) as Lang);
  }
  return [];
};
