import { dbClient } from '~/clients/dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import type { PutItemCommandInput } from '@aws-sdk/client-dynamodb';
import { PutItemCommand, ReturnValue } from '@aws-sdk/client-dynamodb';
import { composeSKForLang, composeSKForRole } from './utils';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Lang } from '~/types/lang';
import { Role } from '~/types/role';
dayjs.extend(utc);

export const createNewRole = async (role: Role) => {
  const { name } = role;
  const SK = composeSKForRole({ name });
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK,
      ...role,
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  return await dbClient.send(new PutItemCommand(params));
};
