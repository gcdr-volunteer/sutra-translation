import { dbClient } from '~/clients/dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type { PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { PutItemCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { composeSKForLang } from './utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Lang } from '~/types/lang';
dayjs.extend(utc);

export const createNewLang = async (team: Lang) => {
  const { name } = team;
  const SK = composeSKForLang({ name });
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK,
      ...team,
      createdAt: dayjs.utc().format(),
      createdBy: 'Admin',
      updatedAt: dayjs.utc().format(),
      updatedBy: 'Admin',
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient.send(new PutItemCommand(params));
};
