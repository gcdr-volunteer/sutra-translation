import { dbClient } from '~/clients/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import type {
  PutItemCommandInput,
  GetItemCommandInput,
  UpdateItemCommandInput,
} from '@aws-sdk/client-dynamodb';
import {
  PutItemCommand,
  ReturnValue,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { composeIdForUser } from './utils';
import { Team, User } from '~/types/user';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
interface DBUser extends User {
  password: string;
}
const _isAdminUserExist = async (): Promise<boolean> => {
  const params: GetItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK: 'USER-pttdev123@gmail.com',
    }),
  };
  const { Item } = await dbClient.send(new GetItemCommand(params));
  return Boolean(Item);
};
const _createAdminUser = async () => {
  const adminUser: DBUser = {
    username: 'Terry Pan',
    password: '0987654321',
    team: Team.TEAM0001,
    origin_lang: 'ZH',
    target_lang: 'EN',
    roles: ['Admin'],
    email: 'pttdev123@gmail.com',
    first_login: true,
  };
  await createNewUser(adminUser);
};

export const onlyCreateAdminUserWhenFirstSystemUp = async (): Promise<void> => {
  const isAdminExist = await _isAdminUserExist();
  if (!isAdminExist) {
    await _createAdminUser();
  }
};

export const getUserByEmail = async (email: string): Promise<DBUser | undefined> => {
  const SK = composeIdForUser({ email });
  const params: GetItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK,
    }),
  };
  const { Item } = await dbClient.send(new GetItemCommand(params));
  if (Item) {
    return unmarshall(Item) as DBUser;
  }
  return undefined;
};

export const updateUserPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const SK = composeIdForUser({ email });
  const hashedPassword = await bcrypt.hash(password, 10);
  const params: UpdateItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Key: marshall({
      PK: 'TEAM',
      SK,
    }),
    ConditionExpression: 'attribute_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
      '#password': 'password',
    },
    ExpressionAttributeValues: marshall({
      ':password': hashedPassword,
      ':first_login': false,
    }),
    UpdateExpression: 'Set #password = :password, first_login = :first_login',
  };

  await dbClient.send(new UpdateItemCommand(params));
};

export const createNewUser = async (user: DBUser) => {
  const {
    password,
    email,
    createdAt = dayjs.utc().format(),
    createdBy = 'Admin',
    updatedAt = dayjs.utc().format(),
    updatedBy = 'Admin',
    ...rest
  } = user;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sortKey = composeIdForUser({ email: email });
  const params: PutItemCommandInput = {
    TableName: process.env.USER_TABLE,
    Item: marshall({
      PK: 'TEAM',
      SK: sortKey,
      email,
      password: hashedPassword,
      createdAt,
      createdBy,
      updatedAt,
      updatedBy,
      ...rest,
    }),
    ConditionExpression: 'attribute_not_exists(#SK)',
    ExpressionAttributeNames: {
      '#SK': 'SK',
    },
    ReturnValues: ReturnValue.ALL_OLD,
  };
  const results = await dbClient.send(new PutItemCommand(params));
  return results;
};
